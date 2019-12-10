---
layout:     post
title:       "Asynchronous injection in RESTEasy"
subtitle:   ""
date:       Jul 19, 2018 5:05:10 AM
author:     Stephane Epardaud
---


                    



                    




Now that we&#39;ve seen [RxJava support in RESTEasy](https://developer.jboss.org/community/resteasy/blog/2018/06/04/asynchronous-reactive-rxjava-and-beyond), we&#39;re ready to build on more reactive applications to illustrate common reactive use-cases.

 

Let&#39;s create an application with several types of requests, that we collect statistics on, such as the number of times each request has been called. And let&#39;s store those statistics in a [Redis](https://redis.io/) instance. For that we will use the [Vert.x Redis client](https://vertx.io/docs/vertx-redis-client/java/) because it supports RxJava out of the box.

 

### A sample application

 

So we will be importing the following Maven modules:

 

`&lt;!-- For RESTEasy --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.jboss.resteasy&lt;/groupId&gt;
    &lt;artifactId&gt;resteasy-jaxrs&lt;/artifactId&gt;
    &lt;version&gt;4.0.0-SNAPSHOT&lt;/version&gt;
&lt;/dependency&gt;
&lt;!-- For RESTEasy&#39;s support of RxJava 2 --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;org.jboss.resteasy&lt;/groupId&gt;
    &lt;artifactId&gt;resteasy-rxjava2&lt;/artifactId&gt;
    &lt;version&gt;4.0.0-SNAPSHOT&lt;/version&gt;
&lt;/dependency&gt;
&lt;!-- For the Vert.x Redis client --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;io.vertx&lt;/groupId&gt;
    &lt;artifactId&gt;vertx-redis-client&lt;/artifactId&gt;
    &lt;version&gt;3.5.3&lt;/version&gt;
&lt;/dependency&gt;
&lt;!-- For the Vert.x RxJava 2 support --&gt;
&lt;dependency&gt;
    &lt;groupId&gt;io.vertx&lt;/groupId&gt;
    &lt;artifactId&gt;vertx-rx-java2&lt;/artifactId&gt;
    &lt;version&gt;3.5.3&lt;/version&gt;
&lt;/dependency&gt;
`




 

Now, in order to make sure I get a single Redis client for my application, I will have to make it injectable by RESTEasy with the 
@Context
 annotation, and there&#39;s no support for pluggable injection in JAX-RS so it&#39;s a little convoluted, but we can achieve that with the help of this custom 
Feature
:

 

`@Provider
public class RedisFeature implements Feature {

  private RedisClient redis;

  public RedisFeature(){
    // connect to the local Redis
    redis = RedisClient.create(Vertx.vertx());
  }

  public boolean configure(FeatureContext context) {
    // this is tied to the deployment, which is what we want for the redis client
    if(context.getConfiguration().getRuntimeType() == RuntimeType.CLIENT)
      return false;
    Dispatcher dispatcher = ResteasyProviderFactory.getContextData(Dispatcher.class);
    if(dispatcher == null) {
      // this can happen, but it means we&#39;re not able to find a deployment
      return false;
    }
    dispatcher.getDefaultContextObjects().put(RedisClient.class, redis);
    return true;
  }
}`




 

We can now write our three requests that collect usage statistics (they inject the 
RedisClient
):

 

`@Path(&#34;/&#34;)
public class Resource {
  @Context
  private RedisClient redis;

  @Path(&#34;req1&#34;)
  @GET
  public Single&lt;String&gt; req1() {
    return redis.rxIncr(&#34;req1.count&#34;).map(count -&gt; &#34;Req1 count: &#34;+count);
  }

  @Path(&#34;req2&#34;)
  @GET
  public Single&lt;String&gt; req2() {
    return redis.rxIncr(&#34;req2.count&#34;).map(count -&gt; &#34;Req2 count: &#34;+count);
  }

  @Path(&#34;req3&#34;)
  @GET
  public Single&lt;String&gt; req3() {
    return redis.rxIncr(&#34;req3.count&#34;).map(count -&gt; &#34;Req3 count: &#34;+count);
  }
}`




 

As you can see we count usage in the Redis keys 
req1.count
, 
req2.count
 and 
req3.count
.

 

Now, if we want to display them, we have to get all three values, which either means a lot of nesting with RxJava, or (better) using the [Single.zip](http://reactivex.io/documentation/operators/zip.html) operator:

 

`@GET
public Single&lt;String&gt; info(){
  return Single.zip(redis.rxGet(&#34;req1.count&#34;), redis.rxGet(&#34;req2.count&#34;), redis.rxGet(&#34;req3.count&#34;),
    (req1, req2, req3) -&gt; &#34;Request 1: &#34;+req1+&#34;\nRequest 2: &#34;+req2+&#34;\nRequest 2: &#34;+req3);  
}`




 

As you can see, with RxJava, getting several values is a little more verbose than if we were doing it in blocking style. In fact, in real applications it is very common to start most requests with actions that depend on resolving a few asynchronous values. They can be waiting for database results, querying caches, or even obtaining permission lists, but eventually, lots of your requests will start with a 
Single.zip
 call to get the values you need in your request. That&#39;s annoying, and when they are often the same values, that&#39;s just plain boilerplate.

 

### The solution

 

What if RESTEasy could take all those async values that you need, and resolve them before it called your resource method? This is called _asynchronous injection_, and the latest RESTEasy does just that.

 

The async values we want to be resolved are originally of type 
Single&lt;String&gt;
, so their resolved value is of type 
String
. In order to get async injection, we annotate our injected resolved value with 
@Context
, and RESTEasy will look up a 
ContextInjector
 that is declared to resolve values to 
String
. In our case, we declare our 
ContextInjector
 to resolve values from type 
Single&lt;String&gt;
 to 
String
, but any async type is supported, thanks to the existing support for pluggable async types.

 

Once we&#39;ve declared our 
ContextInjector
, RESTEasy will call it to get the 
Single&lt;String&gt;
 that provides the 
String
 we want asynchronously injected, and will wait for the async value to be resolved, and only then proceed to inject it in your resource method. This way, when you start your resource method, you already have all your async values resolved!

 

For our example, we&#39;re going to describe our redis queries with the 
@RedisQuery
 annotation:

 

`@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface RedisQuery {
  String value();
}`




 

Now we can write our new resource method that wants these redis queries injected:

 

`@Path(&#34;inject&#34;)
@GET
public String infoInjection(@Context @RedisQuery(&#34;req1.count&#34;) String req1,
    @Context @RedisQuery(&#34;req2.count&#34;) String req2,
    @Context @RedisQuery(&#34;req3.count&#34;) String req3){
  return &#34;Request 1: &#34;+req1+&#34;\nRequest 2: &#34;+req2+&#34;\nRequest 2: &#34;+req3;
}`




 

And all we have to do for that async injection to work is to declare our 
ContextInjector
:

 

`@Provider
public class RedisInjector implements ContextInjector&lt;Single&lt;String&gt;, String&gt; {

  @Override
  public Single&lt;String&gt; resolve(Class&lt;?&gt; rawType, Type genericType, Annotation[] annotations) {
    RedisClient redisClient = ResteasyProviderFactory.getContextData(RedisClient.class);
    for (Annotation annotation : annotations) {
      if(annotation.annotationType() == RedisQuery.class) {
        String query = ((RedisQuery) annotation).value();
         // let&#39;s inject !
        return redisClient.rxGet(query);
      }
    }
    // not for us: try other injectors
    return null;
  }
}`




 

As you can see, we just have to declare that our 
ContextInjector
 can provide values of type 
String
 via an async type 
Single&lt;String&gt;
, and check the annotations on the injection point to figure out what query to run.

 

As I mentioned previously, this is not limited to async values of type 
Single
, because [any async value type is supported via plugins](https://docs.jboss.org/resteasy/docs/3.5.1.Final/userguide/html/Reactive.html), and in fact only 
CompletionStage
 is supported by default (
Single
 being provided by the 
resteasy-rxjava2
 module we&#39;re using).

 

### Conclusion

### 

We&#39;ve removed yet another common cause of boilerplate: rejoice!

 

Async injection was added in the latest [4.0.0.Beta4](https://developer.jboss.org/community/resteasy/blog/2018/07/02/resteasy-360final-and-400beta4) release ([RESTEASY-1905](https://issues.jboss.org/projects/RESTEASY/issues/RESTEASY-1905?filter=allopenissues)). Go ahead and try it out while it&#39;s fresh!




                    




                    

                    


                
