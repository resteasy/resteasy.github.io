---
layout:     post
title:      "gRPC and WildFly - Part II: Exposing Jakarta RESTFul Web Services to gRPC"
subtitle:   ""
date:       2023-06-11
author:     Ron Sigal
---

In Part I of this two part series ([**grpc and WildFly - Part I**](https://www.wildfly.org/news/2023/06/12/grpc-subsystem/)),
we discussed WildFly's grpc subsystem, which supports [gRPC](https://grpc.io/) services. Here, we introduce the
RESTEasy [**resteasy-grpc**](https://github.com/resteasy/resteasy-grpc) project, which allows gRPC clients
to communicate with [**Jakarta RESTFul Web Services**](https://jakarta.ee/specifications/restful-ws/).

We assume here that the reader is familiar with [WildFly](https://www.wildfly.org/), Jakarta REST, 
[protobuf](https://protobuf.dev/), and gRPC. There is a brief introduction to gRPC in Part I.

gRPC is a fairly open system. For example

1. client and server code can be written in different programming languages;
2. gRPC typically runs over the protobuf transport layer, but others can be substituted.

But it's generally assumed that there's a gRPC client on one end and a gRPC server on the other. Here, we go a
step further and support communication between a gRPC client and a Jakarta REST server. A use case might be, for
example, a desire to take advantage of protobuf's network speed in communicating with an existing Jakarta REST application.

## Building a bridge between gRPC and Jakarta REST

As we discussed in Part I, a gRPC application begins with a protobuf description of the supported datatypes
and procedure calls. Now, however, we are assuming the prior existence of a Jakarta REST application with no
such description. We call that the **target project**. To get started, then, we have to create a protobuf
characterization of the API supported by the target project.

### Generating a protobuf description

Using the [**JavaParser project**](https://github.com/javaparser/javaparser), the **grpc-bridge** module in resteasy-grpc
scans a directory of Java source files, checking annotations to discover Jakarta REST resource methods. From those
it derives a set of message types, and from the types and methods it constructs a protobuf description. 

Consider the [grpc-bridge-example](https://github.com/resteasy/resteasy-examples/tree/main/grpc-bridge-example), a variation
on the helloworld example we looked at in Part I. Given the resource method
```java
    @GET
    @Path("greet/{s}")
    @Produces(MediaType.APPLICATION_JSON)
    public Greeting greet(@PathParam("s") String s) {
        return new Greeting("hello, " + s);
    }
```
we can deduce that we have to represent message types `String` and `Greeting`. A human looking at that and
the definition of `Greeting`
```java
    package dev.resteasy.example.grpc.greet;

    public class Greeting {
        private String s;

        public Greeting(String s) {
            this.s = s;
        }

        ...

        public String getS() {
            return s;
        }

        public void setS(String s) {
            this.s = s;
        }

        ...
    }
```
might devise a protobuf description something like
```
    service Greeter {
      rpc greet (String) returns (Greeting) {}
    }

    message Greeting {
      string name = 1;
    }
```
It turns out, though, that the semantic disparity between gRPC and Jakarta REST
forces additional complexity on the description. Instead, we get something considerably 
more complicated:
```
    option java_package = "example.grpc";
    option java_outer_classname = "Greet_proto";

    service GreetService {
    // greet/{s} gEmpty dev_resteasy_example_grpc_greet___Greeting GET sync
      rpc greet (GeneralEntityMessage) returns (GeneralReturnMessage);
    }

    message dev_resteasy_example_grpc_greet___Greeting {
      string s = 1;
    }

    ...
    message gEmpty {}
    message gInteger   {int32  value = 1;}
    ...

    message gHeader {
       repeated string values = 1;
    }

    message gCookie {
       string name = 1;
       ...
    }

    message gNewCookie {
       string name = 1;
       ...
    }

    message ServletInfo {
       string characterEncoding = 1;
       ...
    }

    message FormValues {
       repeated string formValues_field = 1;
    }

    message FormMap {
       map<string, FormValues> formMap_field = 1;
    }

    message GeneralEntityMessage {
       ServletInfo servletInfo = 1;
       string URL = 2;
       map<string, gHeader> headers = 3;
       repeated gCookie cookies = 4;
       string httpMethod = 5;
       oneof messageType {
          gEmpty gEmpty_field = 6;
          FormMap form_field = 7;
       }
    }

    message GeneralReturnMessage {
       map<string, gHeader> headers = 1;
       repeated gNewCookie cookies = 2;
       gInteger status = 3;
       oneof messageType {
          dev_resteasy_example_grpc_greet___Greeting dev_resteasy_example_grpc_greet___Greeting_field = 4;
       }
    }
```
Let's unpack all this complexity.

1. One of the differences between gRPC and Jakarta REST concerns the arguments transmitted from the client to
the server. While gRPC supports a single parameter of some message type, Jakarta REST supports, in addition to
a single entity parameter, things like path parameters, query parameters, header parameters, form parameters, etc. That's why
we have the `GeneralEntityMessage` message type. Consider the `oneof` field. In general, this field is meant
to hold any entity message type that can be sent from the client. Oddly, there are no entries other than the
`FormMap`, which doesn't happen to be relevant here, and `gEmpty`. But go back to the definition of `greet()` and note
that there is no entity parameter. The single parameter is a path parameter, and it can be transmitted in the
`URL` field of the `GeneralEntityMessage`. Similarly, the general purpose `GeneralReturnMessage` has a `oneof`
field, and, in this case, the entry represents the `dev_resteasy_example_grpc_greet___Greeting` type, which is the protobuf
translation of `Greeting`.

2. Another issue is the lack of a notion of packages in protobuf. We adopt the use of underscores to represent
package names, e.g., `dev_resteasy_example_grpc_greet___Greeting`. So, the package `dev.resteasy.example.grpc.greet`
turns into `dev_resteasy_example_grpc_greet`, and we use `___` to separate the package from the class name.

3. Without getting into the details, we'll just mention that the comment

```
   // greet/{s} gEmpty dev_resteasy_example_grpc_greet___Greeting GET sync
```
holds information that is passed on for subsequent processing.

Another significant semantic difference between gRPC and Jakarta REST is that protobuf data types, necessarily
the least common denominator of various programming languages, have no notion of class inheritance, so we
have to make use of what's available to represent subclasses.

Suppose we introduce class `GeneralGreeting`

```java
    public class GeneralGreeting extends Greeting {
        private String salute;

        public GeneralGreeting(String salute, String s) {
            super(s);
            this.salute = salute;
        }

        ...

        public String getSalute() {
            return salute;
        }

        public void setSalute(String salute) {
            this.salute = salute;
        }

        ...
    }
```
and extend `Greeter`:

```java
    @GET
    @Path("salute/{s}")
    @Produces(MediaType.APPLICATION_JSON)
    public GeneralGreeting generalGreet(@QueryParam("salute") String salute, @PathParam("s") String s) {
        return getGeneralGreeting(salute, s);
    }

    private GeneralGreeting getGeneralGreeting(String salute, String name) {
        return new GeneralGreeting(salute, name);
    }
```

Now, when we generate the protobuf file, we get another rpc call:

```
   service GreetService {
   ...
   // salute/{s} gEmpty dev_resteasy_example_grpc_greet___GeneralGreeting GET sync
      rpc generalGreet (GeneralEntityMessage) returns (GeneralReturnMessage);
   }
```

and a new message type:

```
   message dev_resteasy_example_grpc_greet___GeneralGreeting {
      string salute = 1;
      dev_resteasy_example_grpc_greet___Greeting greeting___super = 2;
   }
```

Here, the field called `greeting___super` is meant to be interpreted as the superclass of
`dev_resteasy_example_grpc_greet___GeneralGreeting`. That's not enforced by protobuf, but
it will be treated as inheritance by the grpc-bridge code.

Note, by the way, that the method `getGeneralGreeting()` does not lead to an rpc call because,
due to its lack of Jakarta REST annotations, it's not a resource method.

### Building an intermediate layer

Now that we have a protobuf description of message types and remote calls, we can apply the java version of
the protobuf compiler together with its gRPC plugin to create the client and server side frameworks. There are two
outputs.

The protobuf compiler itself generates a class like `example.grpc.Greet_proto`, which has an inner class
for each [^messageType]. For example,

```java
   public static final class dev_resteasy_example_grpc_greet___Greeting extends
         com.google.protobuf.GeneratedMessageV3 implements
         dev_resteasy_example_grpc_greet___GreetingOrBuilder {

      ...
      @java.lang.Override
      public java.lang.String getS() {
         ...
      }      
   ...
   }
```

`dev_resteasy_example_grpc_greet___Greeting` has over 500 lines of code and isn't really meant for human consumption.
What is interesting to note is the relationship between `dev.resteasy.example.grpc.greet.Greeting` and
`dev_resteasy_example_grpc_greet___Greeting`. The former is the original Java class, but the latter is
also a Java class. They live in different worlds, though. `dev.resteasy.example.grpc.greet.Greeting` is
part of the Jakarta REST application. `dev_resteasy_example_grpc_greet___Greeting` is a Java
expression of the `dev_resteasy_example_grpc_greet___Greeting` protobuf message type. To disambiguate
the two Java classes, we refer to to `dev_resteasy_example_grpc_greet___Greeting` as the
**javabuf** class corresponding to `dev.resteasy.example.grpc.greet.Greeting`.

The other output, which is generated by the gRPC plugin to the protobuf compiler, is 
`example.grpc.GreetServiceGrpc`, which has the client and server side infrastructure for making
remote calls. For our purposes, the important subclass is 

```java
  public static abstract class GreetServiceImplBase implements io.grpc.BindableService {

    public void greet(org.greet.Greet_proto.GeneralEntityMessage request,
        io.grpc.stub.StreamObserver<org.greet.Greet_proto.GeneralReturnMessage> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGreetMethod(), responseObserver);
    }
```
which has a method like `greet()` for each rpc entry in the protobuf description file. The default
implementation indicates that the method is not implemented.

The next step, then, is to override each such method. Typically, that would look something like

```java
public class GreeterServiceImpl extends GreeterGrpc.GreeterImplBase {

    @Override
    public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
        String name = request.getName();
        String message = "Hello " + name;
        responseObserver.onNext(HelloReply.newBuilder().setMessage(message).build());
        responseObserver.onCompleted();
    }
    ...
}
```

from the helloworld example; that is, it would have some business logic. Here, though, the business
logic is already implemented in the Jakarta REST target project, and we want to override the methods
with code that will appropriately dispatch control to the right method in the target project. In
particular, we will create a servlet environment analogous to the one RESTEasy would create. grpc-bridge
will generate class `example.grpc.GreetServiceGrpcImpl`, where the overriding code will look like

```java
@java.lang.Override
public void greet(example.grpc.Greet_proto.GeneralEntityMessage param, StreamObserver<example.grpc.Greet_proto.GeneralReturnMessage> responseObserver) {
   try {
      HttpServletResponseImpl response = new HttpServletResponseImpl("dev_resteasy_example_grpc_greet___Greeting", "sync", Greet_Server.getServletContext(), builder, fd); // 1
      GeneratedMessageV3 actualParam = param.getGEmptyField();
      HttpServletRequest request = getHttpServletRequest(param, actualParam, "/greet/{s}", response, "GET", "dev_resteasy_example_grpc_greet___Greeting"); // 2
      HttpServletDispatcher servlet = getServlet(); // 3
      activateRequestContext(); // 4
      servlet.service(request.getMethod(), request, response); // 5
      MockServletOutputStream msos = (MockServletOutputStream) response.getOutputStream();
      ByteArrayOutputStream baos = msos.getDelegate();
      ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
      dev_resteasy_example_grpc_greet___Greeting reply = dev_resteasy_example_grpc_greet___Greeting.parseFrom(bais); // 6
      example.grpc.Greet_proto.GeneralReturnMessage.Builder grmb = createGeneralReturnMessageBuilder(response);
      grmb.setDevResteasyGreetGreetingField(reply);
      responseObserver.onNext(grmb.build()); // 7
   } catch (Exception e) {
      responseObserver.onError(e);
   } finally {
      responseObserver.onCompleted();
      if (requestContextController != null) {
         requestContextController.deactivate();
      }
      if (tccl != null) {
         Thread.currentThread().setContextClassLoader(tccl);
      }
   }
}
```

Without getting into all of the details, the following steps occur:

1. create an `HttpServletResponse`
2. create an `HttpServletRequest`
3. find the targeted servlet
4. activate a CDI context
5. pass control into RESTEasy
6. retrieve the response
7. send the response up to the gRPC runtime

grpc-bridge also generates two more classes that are part of the intermediate layer. 

1. `example.grpc.GreetJavabufTranslator` knows how to translate back and forth between each Java message type and its
corresponding javabuf class.
2. `example.grpc.GreetMessageBodyReaderWriter` implements the Jakarta REST interfaces
`jakarta.ws.rs.ext.MessageBodyReader` and `jakarta.ws.rs.ext.MessageBodyWriter`. It's registered
with the RESTEasy runtime, and it uses `GreetMessageBodyReaderWriter` to do the translating.

Note that the response retrieved in step 6 has already been translated by `GreetMessageBodyReaderWriter`
into a javabuf class, so it's ready to be transmitted back to the gRPC client.

## Automating the build

As much as possible we want to simplify the process of creating the intermediary layer, so
we've built the process into a maven archetype
[https://github.com/resteasy/gRPCtoJakartaREST-archetype](https://github.com/resteasy/gRPCtoJakartaREST-archetype).
Its purpose is to create a **bridge project**, which will wrap up the classes of the target project together with the
classes of the intermediary layer into a WAR which can support both Jakarta REST and gRPC clients.

Running, for example,

```bash
    mvn archetype:generate -B \
       -DarchetypeGroupId=dev.resteasy.grpc \
       -DarchetypeArtifactId=gRPCtoJakartaREST-archetype \
       -DarchetypeVersion=1.0.0.Alpha5 \
       -DgroupId=dev.resteasy.examples \
       -DartifactId=grpcToRest.example \
       -Dversion=1.0.0.Final-SNAPSHOT \
       -Dgenerate-prefix=Greet \
       -Dgenerate-package=dev.resteasy.example.grpc.greet \
       -Dresteasy-version=6.2.4.Final \
       -Dgrpc-bridge-version=1.0.0.Alpha2
```
for target project [grpc-bridge-example](https://github.com/resteasy/resteasy-examples/tree/main/grpc-bridge-example) 
(dev.resteasy.examples:grpcToRest.example:1.0.0.Final-SNAPSHOT) will create the skeleton bridge project
dev.resteasy.examples:grpcToRest.example.grpc:1.0.0.Final-SNAPSHOT with contents

```
    grpcToRest.example/pom.xml
    grpcToRest.example/src/main/resources/buildjar
    grpcToRest.example/src/main/resources/deployjar
    grpcToRest.example/src/main/webapp/META-INF/beans.xml
    grpcToRest.example/src/main/webapp/WEB-INF/web.xml
    grpcToRest.example/src/test/java/dev/resteasy/grpc/server/Greet_Server.java
```
The important element is the pom.xml file, which is able to put everything together.

Next, enter grpcToRest.example and execute

```bash
    mvn install
```
which will add the following:

```
    ...
    grpcToRest.example/src/main/java/dev/resteasy/example/grpc/greet/GeneralGreeting.java
    grpcToRest.example/src/main/java/dev/resteasy/example/grpc/greet/Greeter.java
    grpcToRest.example/src/main/java/dev/resteasy/example/grpc/greet/Greeting.java
    grpcToRest.example/src/main/java/GreetingTest
    grpcToRest.example/src/main/proto/Greet.proto
    grpcToRest.example/src/test/java/org/jboss/resteasy/grpc/server/Greet_Server.java
    ...
    grpcToRest.example/target/generated-sources/protobuf/java/org/greet/Greet_proto.java
    ...
    grpcToRest.example/target/generated-sources/protobuf/grpc-java/org/greet/Greet_Server.java
    grpcToRest.example/target/generated-sources/protobuf/grpc-java/org/greet/GreetServiceGrpc.java
    grpcToRest.example/target/generated-sources/protobuf/grpc-java/org/greet/GreetServiceGrpcImpl.java
    grpcToRest.example/target/generated-sources/protobuf/grpc-java/org/greet/GreetJavabufTranslator.java
    grpcToRest.example/target/generated-sources/protobuf/grpc-java/org/greet/GreetMessageBodyReaderWriter.java
    grpcToRest.example/target/grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT.war
```
Here we see

1. the Java classes `GeneralGreeting`, `Greeter`, and `Greeting` from the target project
2. the protubuf description file Greet.proto
3. the intermediary layer classes `GreetServiceGrpc`, `GreetServiceGrpcImpl`, `GreetJavabufTranslator`, and
   `GreetMessageBodyReaderWriter`
4. `Greet_Server`, generated by the archetype, which is a Jakarta REST resource class. We'll discuss that shortly.
5. `GreetingTest`[^GreetingTest], which comes from grpc-bridge-example, the target project. If it's renamed GreetingTest.java,
    it can be used to communicate with and test the WAR.
6. the deployable grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT.war

**Notes.**

 1. The output of grpc-bridge-example is grpcToRest.example-1.0.0.Final-SNAPSHOT.war, but the WAR is not deployed
to any repository. That is, if you want to follow along, you need to download resteasy-examples and build it in
the usual maven manner. 
 2. The WEB-INF/lib directory in grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT.war includes grpc-bridge-runtime-1.0.0.Alpha1-SNAPSHOT.jar,
generated from the resteasy-grpc module **grpc-bridge-runtime**, which supports the intermediary layer at runtime.

## Deploying the bridge project

The simplest environment for deploying the bridge project WAR would be an instance of WildFly with the grpc feature pack
[https://github.com/wildfly-extras/wildfly-grpc-feature-pack](https://github.com/wildfly-extras/wildfly-grpc-feature-pack)
that we introduced in Part I. It will recognize that the WAR holds a gRPC service and register it
with the gRPC runtime.

One non-obvious step is necessary to "activate" the bridge project. Recall the `Greet_Server` resource class
added to the bridge project by the archetype. Making a "native" Jakarta REST call on `Greet_Server` will cause
`dev.resteasy.grpc.bridge.runtime.servlet.GrpcHttpServletDispatcher` in resteasy-grpc's grpc-bridge-runtime module
to capture the bridge project's servlet for subsequent use by `GreetServiceGrpcImpl`. Moreover, the specific
resource method `Greet_Server.startContext()` exists to capture the `ServletContext` for the servlet, and a
"native" Jakarta REST call to `startContext()` will get that done. For example,

```bash
curl http://localhost:9555/grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT/grpcToJakartaRest/grpcserver/context
```

where 

 * 9555 is the default port monitored by the grpc feature pack;
 * "grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT" is the default context for grpcToRest.example.grpc-1.0.0.Final-SNAPSHOT.war;
 * "grpcToJakartaRest" is the servlet-mapping in the bridge project web.xml;
 * "grpcserver" and "context" are derived from the `PATH` annotations in `Greet_Server`.
 
**Note.** If the target environment is a WildFly without the grpc feature pack, or even something other than WildFly,
calling `Greet_Server.start()` will set up an ad hoc gRPC server on port 8082.

## TODO

The current release of the resteasy-grpc project is preliminary. The goal is to be able to cope with all Jakarta REST
semantics. For example, 

1. Java type semantics (primitives, inheritance, inner classes)
2. HTTP elements (cookies, headers)
3. asynchronous resource methods
4. SSE streaming
5. @Context injection

A good indication of what is supported can be seen in the test class `org.jboss.resteasy.test.grpc.AbstractGrpcToJakartaRESTTest`
in https://github.com/resteasy/resteasy-grpc. In fact, all of these are supported except for some aspects of @Context injection.
Jakarta REST requires that implementations that support servlets, which RESTEasy does, should support resource methods like

```
public String method(@Context HttpServletRequest request, @Context HttpServletResponse response) {
    ...
}
``` 
Currently, some but not all of the semantics of `HttpServletRequest` and `HttpServletResponse` are supported. 
Another missing piece is support for CDI scopes other than the request scope.

We invite feedback, including questions, suggestions, bug reports, etc., at https://github.com/resteasy/resteasy-grpc/issues.

## More information

1. The documentation in
[https://github.com/resteasy/resteasy-grpc/blob/main/docs/grpc-bridge.md](https://github.com/resteasy/resteasy-grpc/blob/main/docs/grpc-bridge.md)
is the most comprehensive treatment of the grpc-bridge project.

2. The "README.md" file in https://github.com/resteasy/gRPCtoJakartaREST-archetype discusses the archetype.

3. The "README.md" file in [grpc-bridge-example](https://github.com/resteasy/resteasy-examples/tree/main/grpc-bridge-example)
has a discussion about the example.

## Notes

[^messageType]: Note that if "option java\_multiple_files = true;" appears at the beginning of the protobuf description, each message type is represented as a separate class.

[^GreetingTest]: The reason we don't treat `GreetingTest` as a Java class is that it depends on classes in the intermediary layer, which don't exist until the bridge project is built.
