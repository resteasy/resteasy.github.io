---
layout:     post
title:       "New: Asynchronous container filters"
subtitle:   ""
date:       Jun 18, 2018 12:03:55 A
author:     Stephane Epardaud
---

JAX-RS 2.0 shipped with support for filtering [requests](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerRequestFilter.html) and [responses](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerResponseFilter.html), which enabled a lot of great use-cases for delegating duplicated code away from resources and into filters that would do the same processing for every resource method.

Request filters work by overriding the [ContainerRequestFilter.filter](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerRequestFilter.html#filter-javax.ws.rs.container.ContainerRequestContext-) method and observe or modify the given [context](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerRequestContext.html) object, or [abort the filter chain](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerRequestContext.html#abortWith-javax.ws.rs.core.Response-) with a response if the filter already has a response and the other filters and resource method are not required. Simply returning from the filter method will cause the next filter to be called, or when we have run all the filters, it will invoke the resource method.

Response filters are very similar, but [execute](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerResponseFilter.html) after the resource method has been executed and [produced an entity, status code, headers](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerResponseContext.html), which the filter can then modify if required, or simply return to let the next filters run, or the response be sent to the client.


This is all great, but how does it work in an asynchronous ecosystem ? It doesn&#39;t, really, because even though JAX-RS supports [suspending the request](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/Suspended.html), it only supports it within the resource method: filters are too early (for request filters), or too late (for response filters). 

In RESTEasy 3.5 and 4.0.0, we introduced the ability to [suspend the request in filters](https://docs.jboss.org/resteasy/docs/3.5.0.Final/userguide/html/Interceptors.html#d4e1819). To do that, write your request or response filter as usual, but then cast your context object down to [SuspendableContainerRequestContext](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerRequestContext.html) or [SuspendableContainerResponseContext](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerResponseContext.html) (for response filters), and you can then:


- suspend the request with [SuspendableContainerRequestContext.suspend()](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerRequestContext.html#suspend--)

- resume it normally with [SuspendableContainerRequestContext.resume()](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerRequestContext.html#resume--), to proceed to the next filter or resource method

- resume it with a response with the standard [ContainerRequestContext.abortWith()](https://docs.oracle.com/javaee/7/api/javax/ws/rs/container/ContainerRequestContext.html#abortWith-javax.ws.rs.core.Response-), to directly send that response to the client

- resume it with an exception with [SuspendableContainerRequestContext.resume(Throwable)](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerRequestContext.html#resume-java.lang.Throwable-)

 

Similarly, for response filters, you can:

 

- suspend the request with [SuspendableContainerResponseContext.suspend()](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerResponseContext.html#suspend--)

- resume it normally with [SuspendableContainerResponseContext.resume()](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerResponseContext.html#resume--), to proceed to the next filter or return the response to the client

- resume it with an exception with [SuspendableContainerResponseContext.resume(Throwable)](https://docs.jboss.org/resteasy/docs/3.5.0.Final/javadocs/org/jboss/resteasy/core/interception/jaxrs/SuspendableContainerResponseContext.html#resume-java.lang.Throwable-)

 

Of course, the 
resume()
 methods only work after you&#39;ve called 
suspend()
, but otherwise you can call 
resume()
 right after 
suspend()
, before returning from the filter, in which case the request will not even be made asynchronous, or you can call 
resume()
 later after you return from the method, or even from another thread entirely, in which case the request will become asynchronous.

 

The fact that filters may turn requests asynchronous has no impact at all on the rest of your code: non-asynchronous and asynchronous resource methods continue to work exactly as normal, regardless of the asynchronous status of the request, so you don&#39;t need to modify your code to accommodate for asynchronous filters.

 

### Asynchronous rate-limiter example with Redis

Asynchronous filters are useful for plugging in anything that requires asynchrony, such as reactive security frameworks, async response processing or async caching. We will illustrate how to use asynchronous filters with a rate-limiter example.

 

For that, we will use [RateLimitJ for Redis](https://github.com/mokies/ratelimitj/tree/master/ratelimitj-redis), which uses Redis to store rate-limiting information for your API. This is very useful for sharing rate-limit between your API server cluster, because you can store that info in a Redis cluster, and you don&#39;t have to worry about blocking clients while you&#39;re waiting for Redis to give you the info: you just become asynchronous until you have an answer from Redis.

 

We will first import the right Maven dependency for RateLimitJ:

 

```
<dependency>
  <groupId>es.moki.ratelimitj</groupId>
  <artifactId>ratelimitj-redis</artifactId>
  <version>0.4.2</version>
</dependency>
```




 

And let&#39;s not forget to [install and run a local Redis cluster](https://redis.io/download).

 

We will start by declaring a 
@RateLimit
 annotation that we can use on our resource methods or classes to indicate we want rate limiting: 

```
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface RateLimit {
 /**
 * Number of {@link #unit()} that defines our sliding window.
 */
 int duration();
 /**
 * Unit used for the sliding window {@link #duration()}.
 */
 TimeUnit unit();
 /**
 * Maximum number of requests to allow during our sliding window.
 */
 int maxRequest();
}
```


And we have to declare a 
DynamicFeature
 that enables the filter on annotated methods and classes:


```
@Provider
public class RateLimitFeature implements DynamicFeature {

  private StatefulRedisConnection<string,string> connection;

  public RateLimitFeature(){
    // connect to the local Redis
    connection = RedisClient.create("redis://localhost").connect();
  } 

  public void configure(ResourceInfo resourceInfo, FeatureContext context) {
    // See if we&#39;re rate-limiting
    RateLimit limit = resourceInfo.getResourceMethod().getAnnotation(RateLimit.class);
    if(limit == null)
    limit = resourceInfo.getResourceClass().getAnnotation(RateLimit.class);
    if(limit != null) {
      // add the rate-limiting filter
      Set rules = new HashSet<>();
      rules.add(RequestLimitRule.of(limit.duration(), limit.unit(), limit.maxRequest()));
      
      context.register(new RateLimitFilter(new RedisSlidingWindowRequestRateLimiter(connection, rules)));
    }
  }
}
```
 

And this is how we implement our asynchronous filter:


```
public class RateLimitFilter implements ContainerRequestFilter {

  private RedisSlidingWindowRequestRateLimiter requestRateLimiter;

  public RateLimitFilter(RedisSlidingWindowRequestRateLimiter requestRateLimiter) {
    this.requestRateLimiter = requestRateLimiter;
  }

  public void filter(ContainerRequestContext requestContext) throws IOException {
    // Get access to the remote address
    HttpServletRequest servletRequestContext = ResteasyProviderFactory.getContextData(HttpServletRequest.class);

    // Suspend the request
    SuspendableContainerRequestContext suspendableRequestContext = (SuspendableContainerRequestContext) requestContext;
    suspendableRequestContext.suspend();

    // Query and increment by remote IP
    requestRateLimiter.overLimitAsync("ip:"+servletRequestContext.getRemoteAddr())
      .whenComplete((overlimit, error) -> {
        // Error case
        if(error != null)
          suspendableRequestContext.resume(error);
        // Over limit
        else if(overlimit)
          suspendableRequestContext.abortWith(Response.status(429).build());
        // Good to go!
        else
          suspendableRequestContext.resume();
      });
  }
}
```

Now all we have left to do is to implement a resource with rate-limiting:


```
@Path("/")
public class Resource {

  @Path("free")
  @GET
  public String free() {
    return "Hello Free World";
  }

  @RateLimit(duration = 10, unit = TimeUnit.SECONDS, maxRequest = 2)
  @Path("limited")
  @GET
  public String limited() {
    return "Hello Limited World";
  }
}
```


If you go to 
/free
 you will get an unlimited number of requests, while if you go to 
/limited
 you will get two requests allowed every 10 seconds. The rest of the time you will get an HTTP response of [Too Many Requests (429)](https://tools.ietf.org/html/rfc6585#section-4).

If you have the need for [asynchronous request or response filters](https://docs.jboss.org/resteasy/docs/3.5.1.Final/userguide/html/Interceptors.html#d4e1831), don&#39;t hesitate to give RESTEasy 
3.5.1.Final
 or 
4.0.0.Beta2
 a try.




                    




                    

                    


                
