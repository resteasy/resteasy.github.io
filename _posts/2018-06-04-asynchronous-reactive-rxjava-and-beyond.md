---
layout:     post
title:       "Asynchronous, reactive, rxjava and beyond!"
subtitle:   ""
date:       Jun 4, 2018 9:02:51 AM 
author:     Stephane Epardaud
---
## JAX-RS 1.0: The blocking origins

Originally, JAX-RS code use to be blocking and straightforward, like this resource for example:

```
@Path("/hello")
public class HelloResource {

    @Path("classic")
    @GET
    public String classic() {
        return "Hello World";
    }

}
```
Here, the resource method would return a value immediately. If it would take a long time producing that value, the server would make one of its thread block for the entire duration of the request until it was returned, but more often than not, producing values took negligible time.

I say negligible, but with the appearance of micro-services, this became much less true. Let&#39;s take for example a micro-service that runs parallel to our first service, and delegates to it:

```
@Path("/service")
public class ServiceResource {

    @Context 
    private UriInfo uriInfo;
    
    private URI getUri(Class klass, String method) {
        return uriInfo.getBaseUriBuilder().path(klass).path(klass, method).build();
    }
    
    @Path("classic")
    @GET
    public String classic() {
        Client client = ClientBuilder.newClient();
        try {
            URI uri = getUri(HelloResource.class, "classic");
            String entity = client.target(uri).request().get(String.class);
            return "Service got: "+entity;
        } finally {
            client.close();
        }
    }
}
```
 
Here we&#39;re using the JAX-RS 2.0 REST client to make a blocking HTTP call to our classic hello resource, and then we return it. This is already a heavier class of resource method: one where the thread delegated to it will have to wait for IO for the web-service call to complete, before the response is returned to the client. So it will be more thread-intensive, where those threads will mostly sit around waiting for IO, which is less than optimal.
 

## JAX-RS 2.0: First taste of asynchrony

JAX-RS 2.0 saw the writing on the wall and added support for asynchronous processing: you could now tell the container to suspend the request until you were ready to resume it. You could then run your heavy computation in another thread until you were ready to resume it without blocking the resource method threads:

```
@Path("/hello")
public class HelloResource {

    @Path("suspended")
    @GET
    public void suspended(@Suspended AsyncResponse response) {
        new Thread(() -&gt; {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            response.resume("Hello World (resumed)");
        }).start();
    }
}
```

Naturally this is a bit contrived, with sleep as an example of a heavy task, and creating a new unmanaged thread, but in reality this allowed you to launch your IO requests in an IO pool that would be more efficient and would not block the resource method threads, and once you were done with your IO you could then resume it:

```
@Path("/service")
public class ServiceResource {

//...

    @Path("suspended")
    @GET
    public void suspended(@Suspended AsyncResponse response) {
        Client client = ClientBuilder.newClient();
        URI uri = getUri(HelloResource.class, "suspended");
        client.target(uri).request().async().get(new InvocationCallback() {

            @Override
            public void completed(String entity) {
                response.resume("Service got: "+entity);
            }

            @Override
            public void failed(Throwable throwable) {
                response.resume(throwable);
            }
        });
        response.register((CompletionCallback)t -&gt; client.close());
    }
}
```
 
In this last example, we used the asynchronous support of the JAX-RS client to offload the IO processing to an IO worker, and notify us when we have a result to send back to our client by resuming our suspended request. Notice how everything got more complex than the original blocking example? We had to suspend the request, register listeners for success and failure, and a custom finally block.

## JAX-RS 2.1: Getting Reactive with CompletionStage

JAX-RS 2.1 shipped with awesome features, such as support for the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)-like JDK [CompletionStage](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletionStage.html) for dealing with asynchronous code without the associated [Callback Hell](http://callbackhell.com/).


[![Callback Hell](/img/blog/callback-hell.jpg)

It became simpler to write asynchronous code because you didn&#39;t have to manually suspend the request: your return type of 
CompletionStage
 indicated that the request should be suspended until that 
CompletionStage
 was completed (successfully or not):

```
@Path("/hello")
public class HelloResource {

    @Path("completion-stage")
    @GET
    public CompletionStage completionStage() {
        CompletableFuture future = new CompletableFuture&lt;&gt;();
        new Thread(() -&gt; {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                future.completeExceptionally(e);
                return;
            }
            future.complete("Hello World (resumed from CompletionStage)");
        }).start();
        return future;
    }
}
```
In this (yet again) contrived example, you can see we no longer had to use the 
@Suspended
 annotation or deal with the request in any way: we simply returned a [CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html) (which implements 
CompletionStage
), and the container is responsible for registering a listener on it. Meanwhile, when we&#39;re ready to send our return value, we complete the 
CompletableFuture
 and that will resume the request.

Naturally, again in this case the benefits shine more when it comes to composition, because JAX-RS 2.1 also provides a Reactive REST Client interface via the [rx()](https://javaee.github.io/javaee-spec/javadocs/javax/ws/rs/client/Invocation.Builder.html#rx--) method, which allows us to get a 
CompletionStage
 for the client request, which becomes much easier to compose and return now:

```
@Path("/service")
public class ServiceResource {

  // ...

    @Path("completion-stage")
    @GET
    public CompletionStage completionStage() {
        Client client = ClientBuilder.newClient();
        URI uri = getUri(HelloResource.class, "completionStage");
        CompletionStage future = client.target(uri).request().rx().get(String.class);
        return future
                .thenApply(entity -&gt; "Service got: "+entity)
                .whenComplete((entity, throwable) -&gt; client.close());
    }
}
```

Here we really see the benefits of using reactive: we can provide a pipeline of work, on which we can register operations ([thenApply](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletionStage.html#thenApply-java.util.function.Function-)) and even our finally block ([whenComplete](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletionStage.html#whenComplete-java.util.function.BiConsumer-)) that we just pass along to the container without doing any manual plumbing.

## New in Resteasy: pluggable support for reactive libraries 

It may have sounded like we were at the end of the adventure and had solved every issue, but in reality 
CompletionStage
 is great, but not that rich: libraries such as [Reactive Streams](http://www.reactive-streams.org/) and [RxJava](https://github.com/ReactiveX/RxJava) 1 and 2 provide types that are much richer than 
CompletionStage
, which allow you to compose many more operations in an easier manner.

JAX-RS 2.1 added support for pluggable reactive libraries in the Reactive REST Client, via the [rx(RxInvoker)](https://javaee.github.io/javaee-spec/javadocs/javax/ws/rs/client/Invocation.Builder.html#rx-java.lang.Class-) method, but did not ship with any default implementation of it short of the default 
CompletionStage
. But annoyingly it is not symmetrical because there is no support for pluggable resource method return types! You can make JAX-RS 2.1 support RxJava in the Reactive REST Client, but you cannot return RxJava values from your resource methods.

The latest Resteasy snapshots fix both issues:

*   You can now [plug in support for any reactive library](https://docs.jboss.org/resteasy/docs/3.5.1.Final/userguide/html/Reactive.html) via the [AsyncResponseProvider](https://docs.jboss.org/resteasy/docs/3.5.1.Final/javadocs/org/jboss/resteasy/spi/AsyncResponseProvider.html) interface ([[RESTEASY-1701] Extend server-side async support / RxJava integration - JBoss Issue Tracker](https://issues.jboss.org/browse/RESTEASY-1701)), and
*   We now have the (optional) modules 
resteasy-rxjava1
 and 
resteasy-rxjava2
 which provide [RxInvoker](https://javaee.github.io/javaee-spec/javadocs/javax/ws/rs/client/RxInvoker.html) and 
AsyncResponseProvider
 implementations for RxJava types ([[RESTEASY-1798] Client-side (proxy) support for RxClient and CompletionStage - JBoss Issue Tracker](https://issues.jboss.org/browse/RESTEASY-1798))

Those mean that you can now implement your hello resource using RxJava 2:

 

```
@Path("/hello")
public class HelloResource {
    
    @Path("rx")
    @GET
    public Single rx() {
        return Single.just("Hello World (resumed from rx)")
                .delay(1, TimeUnit.SECONDS);
    }
}
```

And our service similarly:

```
@Path("/service")
public class ServiceResource {

  // ...
    
    @Path("rx")
    @GET
    public Single rx() {
        Client client = ClientBuilder.newClient();
        URI uri = getUri(HelloResource.class, "rx");
        Single ret = client.target(uri).request().rx(SingleRxInvoker.class).get(String.class);
        return ret.map(entity -&gt; "Service got: "+entity)
                .doFinally(() -&gt; client.close());
    }   
}
```
As you can see, it&#39;s now much easier to build Reactive pipelines in Resteasy.


Note that although the pluggable support for reactive types landed in Resteasy 

3.5.0.Final
 and 
4.0.0.Beta2
 releases, the 
RxInvoker
 implementations are only available in the latest 
4.0.0-SNAPSHOT
 snapshots (they&#39;re likely being added to 3.6 branch soon, though).


