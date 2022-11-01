---
layout:     post
title:      "An Introduction to the RESTEasy SeBootstrap Usage"
subtitle:   ""
date:       2022-11-01
author:     Wei Nan Li
---

Since RESTEasy implements the Jakarta RESTful Web Services 3.1 API, it includes an implementation for the `jakarta.ws.rs.SeBootstrap` API. The API allows the `jakarta.ws.rs.core.Application` to be run in a Java SE environment. In this article, I’ll focus on its usage of the feature.

Firstly, the simplest way to use the the feature is to write a code block like this:

```java
SeBootstrap.start(MyApp.class)
        .thenApply(instance -> {
            instance.stopOnShutdown((stopResult -> System.out.println("Container has stopped.")));
            try (Client client = ClientBuilder.newClient()) {
                final Response response = client.target(instance.configuration()
                        .baseUriBuilder()
                        .path("rest")).request().get();
                System.out.println(response.readEntity(String.class));
            }
            return instance;
        }).toCompletableFuture().get();
```

In the above code we use the `SeBootstrap.start()` method to start a service. This registers the `MyApp.class` resource. The `MyApp.class` is just an ordinary `Application` class and contains a basic resource class:

```java
@ApplicationPath("/rest")
public class MyApp extends Application {
    @Override
    public Set<Class<?>> getClasses() {
        return Set.of(MyResource.class);
    }
}
```

Here is the content of the `MyResource` class:


```java
@Path("/")
public class MyResource {
    @GET
    public String get() {
        return "Hello";
    }
}
```

And the `SeBootstrap` interface will take care of the service setup and starting process. If you don’t deal with this code block, the service will exit after the code block is executed and exited. So if you want to hold the service and keep it long running, you can put this line under the above code block:

```java
Thread.currentThread().join();
```

So the code execution will stay running at above point, and the service will be kept open for accessing. In this way the service is used like a normal service. If you just want to start a service inline, and do a client side request, and then let the service go away, you can write code like this:

```java
SeBootstrap.start(ExampleApplication.class, SeBootstrap.Configuration.builder()
                .build())
        .thenApply((instance) -> {
            try (Client client = ClientBuilder.newClient()) {
                final WebTarget target = client.target(instance.configuration().baseUriBuilder());
                final Response response = client.target(instance.configuration()
                                .baseUriBuilder()
                                .path("/foo"))
                        .request()
                        .get();
                System.out.printf("Response: %d - %s%n", response.getStatus(), response.readEntity(String.class));
            }
            return instance;
        })
        .whenComplete((instance, t) -> instance.stop())
        .toCompletableFuture().get(60, TimeUnit.MINUTES);
```

In the above code block, it uses the `thenApply()` method to write a closure, and inside the closure it creates a client and does the request to the service, and processes the response inline. Finally, it uses the `whenComplete()` method to stop the service. To avoid the service quit before the client request is finished, there is `.toCompletableFuture().get(60, TimeUnit.MINUTES)` added at end to wait for the call to be finished, and it sets the timeout period to 60 minutes.

As we can see, the `SeBootstrap` API requires an embedded server. RESTEasy currently has 6 embedded servers implemented. Only `org.jboss.resteasy:resteasy-undertow` and `org.jboss.resteasy:resteasy-undertow-cdi` implement all the features and are the preferred implementations. However, the others will work in most cases. You can even implement your own by implementing the `org.jboss.resteasy.plugins.server.embedded.EmbeddedServer` interface and adding a service file for your implementation.

Here is the list of the currently supported embedded servers:

- `CdiNettyJaxrsServer`
- `NettyJaxrsServer`
- `ReactorNettyJaxrsServer`
- `UndertowCdiEmbeddedServer`
- `UndertowJaxrsServer`
- `VertxJaxrsServer`

There is another server already deprecated and shouldn’t be used:

- `SunHttpJaxrsServer`

In addition, these implementations also honor the `@Priority` annotation giving higher priority to lower values from the annotation. To use one of the embedded servers, RESTEasy will automatically search the `classpath` to find one of the above servers during runtime, and load it automatically. For example, if you want to use the `UndertowCdiEmbeddedServer` as the underlying server, you can add these dependencies to your project:

```xml
<dependencies>
    <dependency>
        <groupId>jakarta.ws.rs</groupId>
        <artifactId>jakarta.ws.rs-api</artifactId>
    </dependency>
    <dependency>
        <groupId>org.jboss.resteasy</groupId>
        <artifactId>resteasy-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.jboss.resteasy</groupId>
        <artifactId>resteasy-undertow-cdi</artifactId>
    </dependency>
</dependencies>
```

As the `pom.xml` section shown above, it adds `resteasy-undertow-cdi` into the dependencies. So the `SeBootstrap` will load the `UndertowCdiEmbeddedServer` provided by `resteasy-undertow-cdi` during the runtime.

> Note: You don't have to add `resteasy-core` into dependency explicitly, because the `reteasy-undertow-cdi` will bring it in.

To see more of the `SeBootstrap` usage, RESTEasy provides a usage example in the `resteasy-quickstart` project:

- [resteasy-quickstarts/bootstrap-cdi at main · resteasy/resteasy-quickstarts · GitHub](https://github.com/resteasy/resteasy-quickstarts/tree/main/bootstrap-cdi)

The above code shows the usage of `SeBootstrap` with `resteasy-undertow-cdi` as the underlying implementation.

> Note: Currently we are cleanning up the [resteasy-example](https://github.com/resteasy/resteasy-examples) project, once we finished working on it we may move the above example back to the `resteasy-example` repository.

In addition, the RESTEasy document contains a section writing about its usage:

- [RESTEasy - Chapter 41.  SeBootstrap](https://docs.jboss.org/resteasy/docs/6.2.1.Final/userguide/html_single/index.html#Se_Bootstrap)

To see more examples, the test code is also a good place to check:

- [resteasy/SeBootstrapTest.java at main · resteasy/resteasy · GitHub](https://github.com/resteasy/resteasy/blob/main/server-adapters/server-adapter-test-base/src/main/java/org/jboss/resteasy/bootstrap/test/SeBootstrapTest.java)

To understand the design of the `SeBootstrap` and its implementation inside RESTEasy, you can read this article:

- [An introduction to the SeBootstrap Spec and the RESTEasy Implementation](https://weinan.io/2022/10/26/resteasy-bootstrap.html)

Enjoy!

