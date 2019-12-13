---
layout:     post
title:       "RESTEasy 4.2.0.Final: performance enhancements and new features"
subtitle:   ""
date:       Aug 5, 2019 4:01:00 AM 
author:     Alessio Soldano
---

I&#39;m pleased to announce that, at the end of last week, **RESTEasy 4.2.0**.Final [has been released](https://resteasy.github.io/downloads.html)! It&#39;s less than two months since the [previous minor](https://developer.jboss.org/community/resteasy/blog/2019/06/27/resteasy-410final-is-available) has been tagged, however the community has been quite active lately (
thanks!!
) and we had a few interesting contributions really deserving a release:

*   Great performance improvements: two parallel efforts on reducing memory footprint improved our internal benchmark numbers quite a lot; both JAX-RS client and server applications should be sensible faster as a consequence of a lower memory allocation rate. Moreover, a couple of nasty bugs resulting in performance penalties in some corner cases have been fixed.
*   [Vert.x](https://vertx.io/) Client HTTP engine: we now have [another implementation](https://docs.jboss.org/resteasy/docs/4.2.0.Final/userguide/html/RESTEasy_Client_Framework.html#vertx_client) of the RESTEasy Client HTTP engine interface, based on _Eclipse Vert.x_ and properly supporting async / non-blocking IO.
*   _Spring Web REST_ integration (experimental): RESTEasy now provides the [ability to process Spring Web REST annotations](https://docs.jboss.org/resteasy/docs/4.2.0.Final/userguide/html/RESTEasy_Spring_Integration.html#d4e2909) (i.e. Spring classes annotated with _@RestController_) and handles related REST requests without delegating to _Spring MVC_.

The latest artifacts are available on the JBoss Nexus repository as well as Maven Central repository. [Quarkus](http://quarkus.io/) is being upgraded as well to benefit from the latest additions mentioned above!

Enjoy!




                    




                    

                    


                
