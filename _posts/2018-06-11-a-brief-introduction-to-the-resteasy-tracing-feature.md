---
layout:     post
title:       "A brief introduction to the RESTEasy Tracing Feature"
subtitle:   ""
date:       Jun 11, 2018 11:53:00 P
author:     Weinan Li
---
Tracing feature is a way for the users of the RESTEasy to understand what&#39;s going on internally in the container when a request is processed. It&#39;s different from the pure logging system or profiling feature, which provide more general information about the request/response info, etc.

On the other hand, the tracing feature provides more internal states of the JAX-RS container. For example, it could be able to show what filters a request is going through, or how long time a request is processed, etc.

## **Introduction to the design of tracing feature**

Currently it doesn&#39;t have a standard or spec to define the tracing feature, so the tracing feature is tightly coupled with the concrete JAX-RS implementation itself.

The RESTEasy tracing feature supports three working modes:

- OFF
- ON_DEMAND
- ALL
ALL will enable the tracing feature. ON_DEMAND mode will give the control to client side: A client can send a tracing request via HTTP header and get the tracing info back from response headers. OFF mode will disable the tracing feature, and this is the default mode.

On the other aspect, the tracing feature has different tracing logging levels. Here is the list of the levels:

- SUMMARY
- TRACE
- VERBOSE

The SUMMARY level will emit some brief tracing information. The TRACE level will produce more detailed tracing information, and the VERBOSE level will generate extremely detailed tracing information. Because there are no specs on these tracing levels yet, so the level of the tracing info is currently defined by RESTEasy internally.

The tracing feature uses the JBoss Logging framework to output the trace log, so the jboss logger configuration controls the final output of the tracing info. If you enable the tracing feature but disable the jboss logger output, you still can&#39;t get the tracing info you want. In addition, the tracing logging levels are mapped to jboss logger log levels, which means the jboss logger controls is the actual place to control the tracing level threshold. 

## **Examples of using tracing feature**

By default, the tracing feature is turned off. If you want to enable the tracing feature, you can set the tracing mode and tracing level via the context-param parameters in your web project’s web.xml file. Here is an example of the setting: 

```  
resteasy.server.tracing.type
 ALL

resteasy.server.tracing.threshold
  SUMMARY
```

With above setting, we have enabled the server tracing, and put the tracing level to summary. If the underlying jboss logger’s output threadshold is higher than the tracing level setting, then the users can start to get the tracing info from server side and from response headers.

Here is some sample text of the server side tracing log:

```
16:06:40,794 INFO  [general] PRE_MATCH_SUMMARY PreMatchRequest
summary: 0 filters [ 0.03 ms]
16:06:40,797 DEBUG [general] REQUEST_FILTER Filter by
[io.weli.tracing.HttpMethodOverride @50d53072] [ 0.09 ms]
16:06:40,797 DEBUG [general] REQUEST_FILTER Filter by
[org.jboss.resteasy.core.AcceptHeaderByFileSuffixFilter @7e6bde58] [
0.03 ms]
16:06:40,798 INFO  [general] REQUEST_FILTER_SUMMARY Request summary: 2
filters [ 1.24 ms]
16:06:40,804 DEBUG [general] REQUEST_FILTER Filter by
[org.jboss.resteasy.plugins.providers.sse.SseEventSinkInterceptor
@27930ef8 #2147483647] [ 0.50 ms]
16:06:40,804 INFO  [general] REQUEST_FILTER_SUMMARY Request summary: 1
filters [ 0.93 ms]
16:06:40,813 INFO  [general] METHOD_INVOKE Resource [SINGLETON|class
io.weli.tracing.TracingConfigResource|io.weli.tracing.TracingConfigResource@7a1234bf]
method=[public java.lang.String
io.weli.tracing.TracingConfigResource.type(org.jboss.resteasy.spi.ResteasyDeployment)]
[10.67 ms]
16:06:40,813 DEBUG [general] DISPATCH_RESPONSE Response:
[org.jboss.resteasy.specimpl.BuiltResponse @28a0b6dc
&lt;200/SUCCESSFUL|OK|java.lang.String @52a345f7&gt;] [ ---- ms]
16:06:40,814 INFO  [general] FINISHED Response status: 200 [ ---- ms]
16:06:40,827 DEBUG [general] RESPONSE_FILTER Filter by
[org.jboss.resteasy.plugins.interceptors.MessageSanitizerContainerResponseFilter
@35bb27cd #4000] [ 0.02 ms]
16:06:40,832 INFO  [general] RESPONSE_FILTER_SUMMARY Response summary:
2782639920301360 filters [2782639925.90 ms]
```

For client side, here is some sample text in response header:

```
16:06:40,938 FINE  [headers] http-outgoing-0 &lt;&lt; HTTP/1.1 200 OK
16:06:40,939 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-008: FINISHED    [ ---- /  3.16 ms |  ---- %]
Response status: 200
16:06:40,939 FINE  [headers] http-outgoing-0 &lt;&lt; Date: Fri, 08 Jun 2018
08:06:40 GMT
16:06:40,939 FINE  [headers] http-outgoing-0 &lt;&lt; Connection: keep-alive
16:06:40,939 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-000: PRE-MATCH   [ 0.00 /  0.00 ms |  0.12 %]
PreMatchRequest summary: 0 filters
16:06:40,939 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-001: REQ-FILTER  [ 0.01 /  0.33 ms |  0.23 %]
Filter by [io.weli.tracing.HttpMethodOverride @50d53072]
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-002: REQ-FILTER  [ 0.01 /  0.60 ms |  0.18 %]
Filter by [org.jboss.resteasy.core.AcceptHeaderByFileSuffixFilter
@7e6bde58]
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-003: REQ-FILTER  [ 0.54 /  0.85 ms | 17.03 %]
Request summary: 2 filters
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt; Content-Type:
application/octet-stream
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt; Content-Length: 48
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-004: REQ-FILTER  [ 0.01 /  1.47 ms |  0.28 %]
Filter by [org.jboss.resteasy.plugins.providers.sse.SseEventSinkInterceptor
@27930ef8 #2147483647]
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-005: REQ-FILTER  [ 0.26 /  1.71 ms |  8.34 %]
Request summary: 1 filters
16:06:40,940 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-006: INVOKE      [ 0.76 /  2.23 ms | 24.08 %]
Resource [SINGLETON|class
io.weli.tracing.TracingConfigResource|io.weli.tracing.TracingConfigResource@7a1234bf]
method=[public java.lang.String
io.weli.tracing.TracingConfigResource.logger(org.jboss.resteasy.spi.HttpRequest)
throws java.lang.NoSuchMethodException]
16:06:40,941 FINE  [headers] http-outgoing-0 &lt;&lt;
X-RESTEasy-Tracing-007: INVOKE      [ ---- /  2.96 ms |  ---- %]
Response: [org.jboss.resteasy.specimpl.BuiltResponse @7534fda1
&lt;200/SUCCESSFUL|OK|java.lang.String @7bf31d77&gt;]
```

Above is some sample tracing text. Currently the tracing feature is still under development, and more tracing info entries will be provided to the users. And the formal document will be provided as the development is going on.

If you’d like to have a look at the tracing feature in action, you can current see the simple test case in RESTEasy master branch: 

[https://github.com/resteasy/resteasy/blob/master/testsuite/integration-tests/src/test/java/org/jboss/resteasy/test/tracing/BasicTracingTest.java](https://github.com/resteasy/resteasy/blob/master/testsuite/integration-tests/src/test/java/org/jboss/resteasy/test/tracing/BasicTracingTest.java)

In above is the brief description of the RESTEasy document.




                    




                    

                    


                
