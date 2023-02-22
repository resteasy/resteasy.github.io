---
layout:     post
title:      "Using MicroProfile OpenAPI With RESTEasy"
subtitle:   ""
date:       2023-02-20
author:     Wei Nan Li
---

The MicroProfile OpenAPI specification defines a standard and programming language-agnostic interface description for HTTP APIs. Here is the API document to the specification:

- [GitHub - OAI/OpenAPI-Specification: The OpenAPI Specification Repository](https://github.com/OAI/OpenAPI-Specification)

In this article I'll introduce the basic usage of the example, and then describe its design. At last, I'll introduce some internal implementations of the OpenAPI feature in WildFly and Quarkus.

## Usage Of The Example

I have added an example showing how to integrate MicroProfile OpenAPI with RESTEasy:

- [resteasy-examples/microprofile-openapi at main · resteasy/resteasy-examples · GitHub](https://github.com/resteasy/resteasy-examples/tree/main/microprofile-openapi)

The README file in the example shows its usage:

- [resteasy-examples/README.adoc at main · resteasy/resteasy-examples · GitHub](https://github.com/resteasy/resteasy-examples/blob/main/microprofile-openapi/README.adoc)

Firstly, it is recommended build the example with the following command:

```bash
$ mvn clean install
```

During the running process of the above command, a WildFly server is provisioned and started, and then the example project will be built as a WAR file and deployed to the provisioned WildFly server, and then the integration tests will also be executed. At last, after all the tests are run, the server will be shutdown.

If you want to run the provision server manually, the following command alone would provision a server and run it(even if the server was already provisioned):

```bash
$ mvn wildfly:run
```

If everything goes fine, you can see the example is deployed, and the OpenAPI service is registered at `/openapi`:

```txt
01:05:51,100 INFO  [org.jboss.as.server.deployment] (MSC service thread 1-2) WFLYSRV0027: Starting deployment of "microprofile-openapi.war" (runtime-name: "microprofile-openapi.war")
01:05:51,481 INFO  [org.wildfly.extension.microprofile.openapi.smallrye] (MSC service thread 1-1) WFLYMPOAI0004: Registered MicroProfile OpenAPI endpoint '/openapi' for host 'default-host'
01:05:51,527 INFO  [org.jboss.resteasy.resteasy_jaxrs.i18n] (ServerService Thread Pool -- 12) RESTEASY002225: Deploying jakarta.ws.rs.core.Application: class dev.resteasy.examples.openapi.ProductApplication
01:05:51,536 INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 12) WFLYUT0021: Registered web context: '/microprofile-openapi' for server 'default-server'
```

To access the OpenAPI document, here is the command and its execution result:

```bash
➤ curl -H "Accept: application/json" http://127.0.0.1:8080/openapi
{
  "openapi" : "3.0.3",
  "info" : {
    "title" : "ProductApplication",
    "version" : "1.0.0"
  },
  "servers" : [ {
    "url" : "/microprofile-openapi"
  } ],
  "paths" : {
    "/products" : {
      "get" : {
        "responses" : {
          "default" : {
            "description" : "return a list of products"
          }
        }
      }
    }
  }
}
```

Above is an introduction to the usage of MicroProfile OpenAPI with RESTEasy, and especially how to deploy the example in WildFly. Next I'll introduce the design of the example.

## Design Of The Example

The example uses the `wildfly-maven-plugin` to deploy the example project into a provisioned WildFly server, and it contains this dependency in the `pom.xml`:

```bash
<dependency>
    <groupId>org.eclipse.microprofile.openapi</groupId>
    <artifactId>microprofile-openapi-api</artifactId>
    <scope>provided</scope>
</dependency>
```

Because WildFly will provide the above dependency, so the scope is marked as `provided`, and then in the `ProductResource` class of the example, it can use the OpenAPI annotation `@APIResponse`:

```java
@Path("/products")
public class ProductResource {
    @APIResponse(description = "return a list of products")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Product[] getProducts() {
        return new Product[] { new Product(111, "JBoss EAP"), new Product(222, "RHEL"),
                new Product(333, "CentOS") };
    }
}
```

With the above annotation, the underlying `smallrye-openapi` will generate the OpenAPI document during runtime. In addition, the example uses the `wildfly-maven-plugin` to manage the WildFly:

```xml
<plugin>
    <groupId>org.wildfly.plugins</groupId>
    <artifactId>wildfly-maven-plugin</artifactId>
    ...
</plugin>
```

And it uses the `org.wildfly:wildfly-galleon-pack` to provision the WildFly:

```xml
<feature-packs>
    <feature-pack>
        <groupId>org.wildfly</groupId>
        <artifactId>wildfly-galleon-pack</artifactId>
        <version>${version.org.wildfly}</version>
        <excluded-packages>
            <name>product.conf</name>
            <name>docs.schema</name>
        </excluded-packages>
    </feature-pack>
    ...
</feature-packs>
```

Another note is to configure the layers properly:

```xml
<layers>
    <layer>jaxrs</layer>
    <layer>microprofile-openapi</layer>
    ...
</layers>
```

As the config shown above, `jaxrs` and `microprofile-openapi` must be included for the example to run. The above two layers will be added into provisioned WildFly distribution during the provision step.

> Note: If you want to check the list of the layers that can be provisioned by Galleon, here is the link of it:
>
> - [Galleon Provisioning Guide](https://docs.wildfly.org/21/Galleon_Guide.html#wildfly_galleon_layers)

For the example to be deployed correctly during testing phase, the following config is added into the `wildfly-maven-plguin`:

```xml
<execution>
    <id>start-test-server</id>
    <phase>pre-integration-test</phase>
    <goals>
        <goal>start</goal>
        <goal>deploy</goal>
    </goals>
    <configuration>
        <skip>${skipTests}</skip>
    </configuration>
</execution>
```

In above config, the `deploy` goal must be set so the example will be deployed into provisioned WildFly distribution during testing phase.
 
> If you want to know more about the usage of `wildfly-maven-plugin`, here is an article for reference:
> 
> - [WildFly Maven Plugin – WildFly Maven Plugin (wildfly-maven-plugin)](https://docs.wildfly.org/wildfly-maven-plugin/)

Above is the introduction to the design of the example. If you are interested in how the OpenAPI feature is implemented in WildFly and Quarkus, the next section is an introduction to the topic.

## Implementation Of The OpenAPI Feature

The underlying implementation framework of MicroProfile OpenAPI used in WildFly is SmallRye OpenAPI:

- [GitHub - smallrye/smallrye-open-api: SmallRye implementation of Eclipse MicroProfile OpenAPI](https://github.com/smallrye/smallrye-open-api)

And here is the `extension-jaxrs` support provided by the project:

- [smallrye-open-api/extension-jaxrs at main · smallrye/smallrye-open-api · GitHub](https://github.com/smallrye/smallrye-open-api/tree/main/extension-jaxrs)

Currently, this extension must be used in an integrated environment such as Quarkus or WildFly. For example, this article shows the usage of the OpenAPI feature in Quarkus:

- [Using OpenAPI and Swagger UI - Quarkus](https://quarkus.io/guides/openapi-swaggerui)

> Note: In Quarkus, the rest APIs itself uses RESTEasy Reactive module to provide the services, and on top of it, the Quarkus OpenAPI provides description to the services APIS. In addition, the example in the articles relies on the `resteasy-reactive-jackson` as dependency.

In the underlying, Quarkus uses the `smallrye-open-api/extension-jaxrs` to generate the OpenAPI document. Here is the handler in Quarkus:

- [quarkus/OpenApiHandler.java at main · quarkusio/quarkus · GitHub](https://github.com/quarkusio/quarkus/blob/main/extensions/smallrye-openapi/runtime/src/main/java/io/quarkus/smallrye/openapi/runtime/OpenApiHandler.java#L60)

In WildFly, it has the module to support the `smallrye-open-api`:

- [wildfly/microprofile/openapi-smallrye at main · wildfly/wildfly · GitHub](https://github.com/wildfly/wildfly/tree/main/microprofile/openapi-smallrye)

It is recommended to use the feature in a container like Quarkus and WildFly. But if you want to directly use the `smallrye-open-api/extension-jaxrs` and wrap it to generate the OpenAPI document, you can refer to the test case in `smallrye-open-api` to see how to do this:

- [smallrye-open-api/ExtraSuiteTestBase.java at main · smallrye/smallrye-open-api · GitHub](https://github.com/smallrye/smallrye-open-api/blob/main/testsuite/extra/src/test/java/test/io/smallrye/openapi/tck/ExtraSuiteTestBase.java#L123)

The test case shows how to wrap the `smallrye-open-api/extension-jaxrs` as `com.sun.net.httpserver.HttpHandler` and use it in `com.sun.net.httpserver.HttpServer`.

Above is the brief introduction to the implementation of the OpenAPI feature in WildFly and Quarkus ecosystems.