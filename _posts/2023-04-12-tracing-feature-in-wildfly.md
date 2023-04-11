---
layout:     post
title:      "Using The RESTEasy Tracing Feature In WildFly"
subtitle:   ""
date:       2023-04-19
author:     Wei Nan Li
---


The RESTEasy tracing feature has been integrated into WildFly since its version 28. The usage of the tracing feature in RESTEasy is already introduced in RESTEasy Documentation[^resteasydoc] and some blog posts[^resteasyposts]. In this article, I’ll focus on the usage of this feature in WildFly.

There is an example in the `resteasy-example`[^resteaasyexample] project showing the usage of the tracing feature, and it uses the Galleon[^galleon] to provision a WildFly 28 server, so I’ll use this example this article.

## Usage Of the Example

To use the example, we need to clone the `resteasy-example` firstly:

```bash
$ git clone https://github.com/resteasy/resteasy-examples.git
```

And then entering the `tracing-example` directory and run the provisioned WildFly server:

```bash
$ pwd
/Users/weli/works/resteasy-examples/tracing-example
```

First to build the project and provision the WildFly server:

```bash
$ mvn install
```

The above command will build the example, download necessary WildFly components. Then run the provisioned WildFly server with the following command:

```bash
$ mvn wildfly:provision wildfly:dev
```

 The above command will start the provisioned WildFly server, and deploy the built `tracing-example.war`. During the above process, the WildFly server will output the log, and here is the relative log output related with the example deployment:

```bash
22:41:27,496 INFO  [org.jboss.as.server.deployment] (MSC service thread 1-5) WFLYSRV0027: Starting deployment of "tracing-example.war" (runtime-name: "tracing-example.war")
22:41:27,930 WARN  [org.jboss.as.jaxrs] (MSC service thread 1-2) WFLYRS0029: The RESTEasy tracing API has been enabled for deployment "tracing-example.war" and is not meant for production.
22:41:28,368 INFO  [org.jboss.resteasy.resteasy_jaxrs.i18n] (ServerService Thread Pool -- 23) RESTEASY002225: Deploying jakarta.ws.rs.core.Application: class dev.resteasy.examples.tracing.TracingApp
22:41:28,411 INFO  [org.hibernate.validator.internal.util.Version] (ServerService Thread Pool -- 23) HV000001: Hibernate Validator 8.0.0.Final
22:41:28,436 INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 23) WFLYUT0021: Registered web context: '/tracing-example' for server 'default-server'
22:41:28,487 INFO  [org.jboss.as.server] (management-handler-thread - 1) WFLYSRV0010: Deployed "tracing-example.war" (runtime-name : "tracing-example.war")
```

From the above log output, we can see the tracing configuration in the example is detected by WildFly and the tracing feature is enabled[^wildflytracing] for this example:

```bash
22:41:27,930 WARN  [org.jboss.as.jaxrs] (MSC service thread 1-2) WFLYRS0029: The RESTEasy tracing API has been enabled for deployment "tracing-example.war" and is not meant for production.
```

In this example, there are settings for the tracing feature in the `web.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_5_0.xsd"
         version="5.0">
    <display-name>tracing-example</display-name>
    <context-param>
        <param-name>resteasy.server.tracing.type</param-name>
        <param-value>ALL</param-value>
    </context-param>
    <context-param>
        <param-name>resteasy.server.tracing.threshold</param-name>
        <param-value>VERBOSE</param-value>
    </context-param>
</web-app>
```

If we need to change the configuration, we need to change the above change and redeploy the project. On the other hand, in WildFly 28, because the tracing feature is already integrated, so we can use the WildFly Command Line Interface to configure the tracing feature at runtime. Using the `jboss-cli.sh` in the provisioned WildFly server to connect to the WildFly server:

```bash
$ pwd
/Users/weli/works/resteasy-examples/tracing-example/target/wildfly/bin
```

```bash
➤ ./jboss-cli.sh --connect
[standalone@localhost:9990 /]
```

And then we can use the CLI command to list the `jaxrs` subsystem:

```bash
[standalone@localhost:9990 /] ls subsystem=jaxrs
jaxrs-2-0-request-matching=false                  resteasy-gzip-max-input=10000000                  resteasy-role-based-security=false                
resteasy-add-charset=true                         resteasy-jndi-resources=undefined                 resteasy-secure-random-max-use=100                
resteasy-buffer-exception-entity=true             resteasy-language-mappings=undefined              resteasy-use-builtin-providers=true               
resteasy-disable-html-sanitizer=false             resteasy-media-type-mappings=undefined            resteasy-use-container-form-params=false          
resteasy-disable-providers=undefined              resteasy-media-type-param-mapping=undefined       resteasy-wider-request-matching=false             
resteasy-document-expand-entity-references=false  resteasy-prefer-jackson-over-jsonb=false          tracing-threshold=SUMMARY                         
resteasy-document-secure-disableDTDs=true         resteasy-providers=undefined                      tracing-type=OFF                                  
resteasy-document-secure-processing-feature=true  resteasy-rfc7232preconditions=false               

[standalone@localhost:9990 /] 
```


From the above command output, we can see there are two attributes related with the tracing feature:

```bash
tracing-threshold=SUMMARY
tracing-type=OFF
```

Now we can change the `tracing-type` from `OFF` to `ON` on the fly:

```bash
[standalone@localhost:9990 /] /subsystem=jaxrs:write-attribute(name=tracing-type, value=ALL)
{
    "outcome" => "success",
    "response-headers" => {
        "operation-requires-reload" => true,
        "process-state" => "reload-required"
    }
} 
```

From the above command output, it says:

```bash
"process-state" => "reload-required"
```

So we need to use the following command to reload the WildFly services:


```bash
[standalone@localhost:9990 subsystem=jaxrs] /:reload
{
    "outcome" => "success",
    "result" => undefined
}
```

And now the configuration is active. We can try to access the service like this:

```bash
➤ curl -i http://localhost:8080/tracing-example/level
```

If everything goes fine, the above command will get back the following tracing info from response header:

```
HTTP/1.1 200 OK
X-RESTEasy-Tracing-026: org.jboss.resteasy.plugins.server.servlet.Servlet3AsyncHttpRequest@ec9985e MBW         [ ---- / 98.11 ms |  ---- %] [org.jboss.resteasy.plugins.providers.StreamingOutputProvider @11b41d1] is skipped
X-RESTEasy-Tracing-027: org.jboss.resteasy.plugins.server.servlet.Servlet3AsyncHttpRequest@ec9985e MBW         [ ---- / 98.12 ms |  ---- %] [org.jboss.resteasy.plugins.providers.AsyncStreamingOutputProvider @5d3eeed1] is skipped
X-RESTEasy-Tracing-028: org.jboss.resteasy.plugins.server.servlet.Servlet3AsyncHttpRequest@ec9985e MBW         [ ---- / 98.12 ms |  ---- %] [org.jboss.resteasy.plugins.providers.InputStreamProvider @6fe549e4] is skipped
X-RESTEasy-Tracing-029: org.jboss.resteasy.plugins.server.servlet.Servlet3AsyncHttpRequest@ec9985e MBW         [ ---- / 98.77 ms |  ---- %] Find MBW for type=[java.lang.String] genericType=[java.lang.String] mediaType=[[jakarta.ws.rs.core.MediaType @522d49f4]] annotations=[@jakarta.ws.rs.GET(), @jakarta.ws.rs.Path("/level")]
...
````

From the above command output, we can see the tracing feature is enabled. Now we try to disable the tracing feature by running the following command in WildFly CLI:

```bash
[standalone@localhost:9990 subsystem=jaxrs] :write-attribute(name=tracing-type, value=OFF)
{
    "outcome" => "success",
    "response-headers" => {
        "operation-requires-reload" => true,
        "process-state" => "reload-required"
    }
}

[standalone@localhost:9990 subsystem=jaxrs] cd /
[standalone@localhost:9990 /] :reload
{
    "outcome" => "success",
    "result" => undefined
}
```

And now we can try to access the example service again:

```bash
➤ curl -i http://localhost:8080/tracing-example/level
HTTP/1.1 200 OK
Connection: keep-alive
Content-Type: application/octet-stream
Content-Length: 7
Date: Tue, 11 Apr 2023 18:43:04 GMT
...
```

From the above output, we can see the tracing feature is disabled.

## References

[^resteasydoc]: [Chapter 54. RESTEasy Tracing Feature](https://docs.jboss.org/resteasy/docs/6.2.3.Final/userguide/html_single/index.html#Tracing_Feature)

[^resteasyposts]: [A brief introduction to the RESTEasy Tracing Feature](https://resteasy.dev/2018/06/11/a-brief-introduction-to-the-resteasy-tracing-feature/) / [RESTEasy Tracing Feature Now - Supports JSON formatted information](https://resteasy.dev/2018/09/05/resteasy-tracing-feature-now-supports-json-formatted-information/)

[^resteaasyexample]: [Tracing Example](https://github.com/resteasy/resteasy-examples/tree/main/tracing-example)

[^galleon]: [Galleon Provisioning](https://github.com/wildfly/galleon)

[^wildflytracing]: [Using the Tracing Feature](https://github.com/wildfly/wildfly/pull/15198/files#diff-b1b3a12a4b68c3397dacaab84d50790141d87677f46552c5138f520312aa3782R155)

