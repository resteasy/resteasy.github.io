---
layout:     post
title:       "RESTEasy Tracing Feature Now Supports JSON formatted information"
subtitle:   ""
date:       Sep 5, 2018 5:01:00 AM 
author:     Weinan Li
---

Previously, the RESTEasy tracing feature just support the pre-formatted, text-based information like this:

```
$ curl -i http://localhost:8081/foo | head  
...  
 X-RESTEasy-Tracing-000: START       [ ---- /  ---- ms |  ---- %] baseUri=[http://localhost:8081/] requestUri=[http://localhost:8081/foo] method=[GET] authScheme=[n/a] accept=*/* accept-encoding=n/a accept-charset=n/a accept-language=n/a content-type=n/a content-length=n/a  
 X-RESTEasy-Tracing-001: START       [ ---- /  0.60 ms |  ---- %] Other request headers: Accept=[*/*] Host=[localhost:8081] User-Agent=[curl/7.55.1]  
1X-RESTEasy-Tracing-002: PRE-MATCH   [ 0.01 /  2.54 ms |  0.00 %] PreMatchRequest summary: 0 filters  
0X-RESTEasy-Tracing-003: REQ-FILTER  [ 0.02 /  5.35 ms |  0.00 %] Filter by [io.weli.tracing.HttpMethodOverride @4b8ca04a]  
0X-RESTEasy-Tracing-004: REQ-FILTER  [ 0.03 /  5.66 ms |  0.00 %] Filter by [org.jboss.resteasy.core.AcceptHeaderByFileSuffixFilter @4d5e22c1]  
 X-RESTEasy-Tracing-005: REQ-FILTER  [ 0.73 /  5.88 ms |  0.00 %] Request summary: 2 filters  
  X-RESTEasy-Tracing-006: MATCH       [ ---- /  6.44 ms |  ---- %] Matched resource: template=[[org.jboss.resteasy.core.registry.ClassExpression @7e528471]] regexp=[\Q\E(.*)] matches=[[org.jboss.resteasy.core.registry.SegmentNode @5072e501]] from=[]  
  X-RESTEasy-Tracing-007: MATCH       [ ---- /  6.60 ms |  ---- %] Matching path [/foo]  
...
```
This kind of tracing info is easy for the human to read, but it’s hard for program to process. Especially when it’s used in a distributed environemnt when the tracing info need to be passed across applications.

So now we add the feature to let tracing info to be returned in JSON format. To use this feature, you need to add the `tracing-api` as dependency firstly:

```
<dependency>
    <groupId>org.jboss.resteasy</groupId>
    <artifactId>resteasy-tracing-api</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```
As shown above, now the `tracing-api` is a standalone project and it belongs to the `resteasy-extensions` project:
> [https://github.com/resteasy/resteasy-extensions](https://github.com/resteasy/resteasy-extensions)

After including the above basic package, then we need to choose a JSON provider for tracing module to generate JSON formatted info.

There are two JSON providers you can choose from and they both support the tracing feature.
One is the `jackson2` provider:
```
<dependency>
    <groupId>org.jboss.resteasy</groupId>
    <artifactId>resteasy-jackson2-provider</artifactId>
    <version>4.0.0-SNAPSHOT</version>
</dependency>
```
The other option is to use the `json-binding` provider:

```
<dependency>
    <groupId>org.jboss.resteasy</groupId>
    <artifactId>resteasy-json-binding-provider</artifactId>
    <version>4.0.0-SNAPSHOT</version>
</dependency>
```

After including either of the above module, now we can request the resource server for JSON formatted data. The method is to send a format request header:
 
``X-RESTEasy-Tracing-Accept-Format: JSON``


Here is a request example:

```
$ curl -H "X-RESTEasy-Tracing-Accept-Format: JSON" -i http://localhost:8081/foo
```
And the response will be like this:

```
X-RESTEasy-Tracing-000:  
[{"duration":0,"event":"START","text":"baseUri=[http://localhost:8081/]  
requestUri=[http://localhost:8081/foo] method=[GET] authScheme=[n/a] accept=*/*  
accept-encoding=n/a accept-charset=n/a accept-language=n/a content-type=n/a  
content-length=n/a  
","timestamp":46600869878437},{"duration":0,"event":"START_HEADERS","text":"Other  
request headers: Accept=[*/*] Host=[localhost:8081] User-Agent=[curl/7.55.1]  
X-RESTEasy-Tracing-Accept-Format=[JSON]   
","timestamp":46600870751617},{"duration":18336,"event":"PRE_MATCH_SUMMARY","tex  
t":"PreMatchRequest summary: 0   
filters","timestamp":46600872781491},{"duration":20724,"event":"REQUEST_FILTER",  
"text":"Filter by [io.weli.tracing.HttpMethodOverride   
@585b0020]","timestamp":46600876716467},{"duration":19414,"event":"REQUEST_FILTE  
R","text":"Filter by [org.jboss.resteasy.core.AcceptHeaderByFileSuffixFilter   
@3779d352]","timestamp":46600877017341},{"duration":657192,"event":"REQUEST_FILT  
ER_SUMMARY","text":"Request summary: 2 filters",  
...
```

After reformat the above response, we can see the response structure is like this:

```
[  
{  
  “duration”: 0,  
  “event”: “START”,  
  “text”: “baseUri=[http://localhost:8081/] requestUri=[http://localhost:8081/foo] method=[GET] authScheme=[n/a] accept=*/* accept-encoding=n/a accept-charset=n/a accept-language=n/a content-type=n/a content-length=n/a “,  
  “timestamp”: 46600869878437  
},  
{  
  “duration”: 0,  
  “event”: “START_HEADERS”,  
  “text”: “Other request headers: Accept=[*/*] Host=[localhost:8081] User-Agent=[curl/7.55.1] X-RESTEasy-Tracing-Accept-Format=[JSON] “,  
  “timestamp”: 46600870751617  
},  
{  
  “duration”: 18336,  
  “event”: “PRE_MATCH_SUMMARY”,  
  “text”: “PreMatchRequest summary: 0 filters”,  
  “timestamp”: 46600872781491  
},  
{  
  “duration”: 20724,  
  “event”: “REQUEST_FILTER”,  
  “text”: “Filter by [io.weli.tracing.HttpMethodOverride @585b0020]”,  
  “timestamp”: 46600876716467  
},  
...  
]
```

The `timestamp` is the event start time, and the other fields are quite straightforward.

The JSON formatted data should be more suitable to be parsed by code.

This feature is currently just in `4.0.0-SNAPSHOT`, and haven’t been officially released yet.




                    




                    

                    


                
