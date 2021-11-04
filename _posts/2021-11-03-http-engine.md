---
layout:     post
title:      "Supporting HTTP Engine Registration In RESTEasy Client and RESTEasy MicroProfile Client"
subtitle:   ""
date:       Nov 03, 2021
author:     Wei Nan Li
---

Recently I have submitted two pull requests in `resteasy` and `resteasy-microprofile` project to allow client side HTTP engine registration:

- [RESTEASY-3031 allow http client inject through registration / HTTP2 support via vertx engine by liweinan · Pull Request #2946 · resteasy/resteasy · GitHub](https://github.com/resteasy/resteasy/pull/2946)
- [Allow Client HTTP Engine Registration #23](https://github.com/resteasy/resteasy-microprofile/pull/20)

By above two pull requests, now we can inject custom HTTP engine into client by the `register()` method defined by the `ClientBuilder` interface.

For example, we can inject a customized `Vert.x` HTTP engine to support `HTTP/2` communitcation, and here is the code example using standard `restesay-client`:

```java
Vertx vertx = Vertx.vertx();
HttpClientOptions options = new HttpClientOptions();
options.setSsl(true);
options.setProtocolVersion(HttpVersion.HTTP_2);
options.setUseAlpn(true);
Client client = ClientBuilder
        .newBuilder()
        .register(new VertxClientHttpEngine(vertx, options))
        .build();
final Response resp = client.target("https://nghttp2.org/httpbin/get").request().get();
assertEquals(200, resp.getStatus());
Assert.assertTrue(resp.readEntity(String.class).contains("nghttp2.org"));
```

From the above code we can see that a customized `VertxClientHttpEngine` instance is registered into client by calling the `register()` method of `ClientBuilder`. To do the same thing by using `resteasy-microprofile-client`, here is the code example:

```java
RestClientBuilder builder = RestClientBuilder.newBuilder().baseUri(URI.create("https://nghttp2.org/"));

Vertx vertx = Vertx.vertx();
HttpClientOptions options = new HttpClientOptions();
options.setSsl(true);
options.setProtocolVersion(HttpVersion.HTTP_2);
options.setUseAlpn(true);

builder.register(new VertxClientHttpEngine(vertx, options));

NgHTTP2 client = builder.build(NgHTTP2.class);

final String resp = client.get();
assertTrue(resp.contains("nghttp2.org"));
```

The difference with `resteasy-client` is that `RestClientBuilder` should be used instead of `ClientBuilder`.

Hope this new feature is useful to you :D





