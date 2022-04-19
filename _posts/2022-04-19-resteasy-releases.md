---
layout:     post
title:      "RESTEasy Releases"
subtitle:   ""
date:       April 19, 2022 11:11:11 PDT
author:     James R. Perkins
---

It is time for the next quarterly releases of RESTEasy. With these releases I'm very pleased to announce the release
of [RESTEasy 6.1.0.Beta1]({{ site.basurl }}/downloads#610beta1). This is the first release which implements 
[Jakarta RESTful Web Services 3.1](https://jakarta.ee/specifications/restful-ws/3.1/).

Along with the 6.1.0.Beta1 release, there have been three bug fix releases; [6.0.1.Final]({{ site.baseurl }}/downloads#601final),
[5.0.3.Final]({{ site.baseurl }}/downloads#503final) and [4.7.6.Final]({{ site.baseurl }}/downloads#476final).

## RESTEasy 6.1.0

The [Jakarta RESTful Web Services 3.1 specification](https://jakarta.ee/specifications/restful-ws/3.1/) is targeted for 
Jakarta EE 10. It also includes a new `SeBootstrap` API for publishing an application on Java SE. You can see a full
list of the specification changes for 3.1 [here](https://jakarta.ee/specifications/restful-ws/3.1/jakarta-restful-ws-spec-3.1.html#changes-since-3.0-release).

While we wait for the Jakarta REST 3.1.0 artifact to be deployed to Maven Central, there is a [temporary fork of the API](#api-dependency)
which can be used. You need to enable the [JBoss Nexus Repository](#jboss-nexus-repository) to use this dependency. Below are some example POM 
snippets.


#### API Dependency
```xml
<dependency>
    <groupId>jakarta.ws.rs</groupId>
    <artifactId>jakarta.ws.rs-api</artifactId>
    <version>3.1.0.RC1-jbossorg-1</version>
</dependency>
```

#### JBoss Nexus Repository
```xml
<repositories>
    <repository>
        <releases>
            <enabled>true</enabled>
            <updatePolicy>never</updatePolicy>
        </releases>
        <snapshots>
            <enabled>true</enabled>
            <updatePolicy>never</updatePolicy>
        </snapshots>
        <id>jboss-public-repository-group</id>
        <name>JBoss Public Repository Group</name>
        <url>https://repository.jboss.org/nexus/content/groups/public/</url>
        <layout>default</layout>
    </repository>
</repositories>
```

### RESTEasy CDI

The RESTEasy CDI extension has been [updated](https://issues.redhat.com/browse/RESTEASY-3079) to allow injection of 
certain types. You can use `@Inject` on the following types for instance fields:

* `jakarta.ws.rs.client.Client`
* `jakarta.ws.rs.container.ResourceContext`
* `jakarta.ws.rs.core.Application`
* `jakarta.ws.rs.core.Configuration`
* `jakarta.ws.rs.core.HttpHeaders`
* `jakarta.ws.rs.core.Request`
* `jakarta.ws.rs.core.Response`
* `jakarta.ws.rs.core.SecurityContext`
* `jakarta.ws.rs.core.UriInfo`
* `jakarta.ws.rs.ext.Providers`
* `jakarta.ws.rs.sse.Sse`

### Example `SeBootstrap` Usage

In RESTEasy the `SeBootstrap` API requires the following dependencies.

```xml
<depenedencies>
    <dependency>
        <groupId>jakarta.ws.rs</groupId>
        <artifactId>jakarta.ws.rs-api</artifactId>
        <version>3.1.0.RC1-jbossorg-1</version>
    </dependency>
    <dependency>
        <groupId>org.jboss.resteasy</groupId>
        <artifactId>resteasy-core</artifactId>
        <version>6.1.0.Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.jboss.resteasy</groupId>
        <artifactId>resteasy-undertow</artifactId>
        <version>6.1.0.Alpha1</version>
    </dependency>
</depenedencies>
```

The `resteasy-undertow` server adaptor is the default adaptor and is what RESTEasy uses for testing with the TCK.

```java
package dev.resteasy.se.bootstrap;

import java.util.Collections;
import java.util.Set;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.SeBootstrap;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Application;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * @author <a href="mailto:jperkins@redhat.com">James R. Perkins</a>
 */
public class Main {

    public static void main(final String[] args) throws Throwable {
        SeBootstrap.Instance instance = SeBootstrap.start(new Application() {
            @Override
            public Set<Class<?>> getClasses() {
                return Collections.singleton(GreetingResource.class);
            }
        }).toCompletableFuture().get();

        try (Client client = ClientBuilder.newClient()) {
            final Response response = client.target(instance.configuration().baseUriBuilder().path("greet/World"))
                    .request().get();
            System.out.println(response.readEntity(String.class));
        }
        instance.stop().toCompletableFuture().get();
    }

    @Path("/greet")
    public static class GreetingResource {

        @GET
        @Produces(MediaType.TEXT_PLAIN)
        @Path("{name}")
        public Response greet(@PathParam("name") final String name) {
            return Response.ok(String.format("Hello %s!", name)).build();
        }
    }
}
```
