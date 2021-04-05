---
layout:     post
title:      "JAX-RS ParamConverter with Quarkus"
subtitle:   ""
date:       Apr 5, 2021 
author:     Rebecca Searls
---
Recently RESTEasy had a request by a user who was implementing their REST 
service with Quarkus for support of an endpoint input parameter type java.time.Instant. 

Lets look at how the user can provide support for java.time.Instant or
any other data type in their REST application.  The code used in this discussion
can be found [here](https://github.com/rsearls/blog-posts/tree/master/ParamConverter-with-Quarkus).

First lets create a Quarkus getting-started app [1] to use in examining this issue.

```
  mvn io.quarkus:quarkus-maven-plugin:1.13.0.Final:create \
      -DprojectGroupId=org.acme \
      -DprojectArtifactId=getting-started \
      -DclassName="org.acme.getting.started.GreetingResource" \
      -Dpath="/hello"
  cd getting-started
```

Edit file ./src/main/java/org/acme/getting/started/GreetingResource.java
and add the following endpoint.

```
    @Path("time")
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String helloTime(@QueryParam("name") String name, @QueryParam("time") Instant time) {
        return "Hello " + name + ", " + time;
    }
```

This is optional. You can also add a test for this endpoint.  Edit
file, ./src/test/java/org/acme/getting/started/GreetingResourceTest.java
and add this code.

```
    @Test
    public void testHelloTimeEndpoint() {
        given()
                .when().get(URI.create("/hello/time?name=abc&time=2021-02-12T09:58:39Z"))
                .then()
                .statusCode(200)
                .body(is("Hello abc, 2021-02-12T09:58:39Z"));
    }
```

Lets run the application and call the endpoint using cURL.
Build and run the application with this Quarkus command,

```
    ./mvnw compile quarkus:dev
```

YIKES what just happened?  I get a InvocationTargetException and a stacktrace.
Looking through the stacktrace I see the root cause is

```
  Caused by: java.lang.RuntimeException: RESTEASY003875: Unable to find a 
  constructor that takes a String param or a valueOf() or fromString() method 
  for javax.ws.rs.QueryParam("time") on public java.lang.String 
  org.acme.getting.started.GreetingResource.helloTime(java.lang.String,java.time.Instant) 
  for basetype: java.time.Instant
```

JAX-RS enables this issue to be resolved with a ParamConverter.
Interfaces ParamConverterProvider and ParamConverter are provided
by the specification just for this situation.
Lets create an implementation for each of these interfaces. 
In directory src/main/java/org/acme/getting/started create file 
InstantParamConverterProvider

```

package org.acme.getting.started;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.time.Instant;

import javax.ws.rs.ext.ParamConverter;
import javax.ws.rs.ext.ParamConverterProvider;
import javax.ws.rs.ext.Provider;

@Provider
public class InstantParamConverterProvider implements ParamConverterProvider {
    @SuppressWarnings("unchecked")
    @Override
    public <T> ParamConverter<T> getConverter(Class<T> rawType,
                                              Type genericType,
                                              Annotation[] annotations) {
        if (rawType.isAssignableFrom(Instant.class)) {
            return (ParamConverter<T>) new InstantParamConverter();
        }
        return null;
    }
}
```

And file InstantParamConverter

```

package org.acme.getting.started;

import javax.ws.rs.ext.ParamConverter;
import javax.ws.rs.ext.Provider;
import java.time.Instant;
import java.time.format.DateTimeParseException;

@Provider
public class InstantParamConverter implements ParamConverter<Instant> {

    public Instant fromString(String value){
        try {
            String x = Instant.parse(value).toString();
            return Instant.parse(value);
        } catch (DateTimeParseException e) {

        }
        return null;
    }

    public String toString(Instant value){
        return value.toString();
    }
}
```

Now run the application.

```
  ./mvnw compile quarkus:dev
```

In a separate terminal window run cURL command.

```
    curl -w "\n" "http://localhost:8080/hello/time?name=abc&time=2021-02-12T09:58:39Z"
```

Result is
```
  Hello abc, 2021-02-12T09:58:39Z
```

The test can be run with this command.

```
  ./mvnw test
```

If you want to walk through the code with the debugger, set your debugger
to port 5005 and run the application with either command

```
    ./mvnw compile quarkus:dev
```

or

```
    ./mvnw compile quarkus:dev -Dsuspend=true
```

In conclusion all elements of the JAX-RS specification still apply when 
writing a RESTful service with Quarkus.


References
[[1] Quarkus getting-started ](https://quarkus.io/guides/getting-started)