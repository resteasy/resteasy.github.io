---
layout:     post
title:       "Looking to the future..."
subtitle:   ""
date:       Oct 8, 2019 7:43:00 PM 
author:     Alessio Soldano
---
If you look at the [download page](https://resteasy.github.io/downloads.html), you might notice that so far 2019 has been a year rich of RESTEasy releases. We&#39;ve made 
_11_
 new versions available to the community, starting 
_a new major_
 (4.0) and 
_six new minor_
 (3.7, 3.8, 3.9, 4.1, 4.2, 4.3) 
_streams_
. This was partially because we&#39;re trying to avoid including features in micro version releases and we&#39;re carefully ensuring that anything that is backported to RESTEasy 3 is fully backward compatible, so that it can be consumed by [WildFly](https://wildfly.org/). The other reason for the high number of minor releases... is basically that we&#39;ve got a lot of good quality contributions from the community! _Thanks!_

As the releases have been somehow unpredictable, I wanted to write down and share a development roadmap, but these days that&#39;s quite a difficult task, especially considering that now RESTEasy is looking at both JakartaEE and Microprofile evolution (which is far from being set in stone ;-)), while both WildFly and Quarkus are feeding RESTEasy&#39;s requirements tracking list and begging for frequent releases ;-) So I think I&#39;ll start with providing some highlights on the areas where the core team is currently willing to focus in the next 12-18 months; clearly I expect the community to influence the actual future of the project.

## JakartaEE ##

[JakartaEE 8 is here](https://jakarta.ee/release/) and 9 is being planned these days. When it comes to the [Jakarta RESTful Web Services](https://projects.eclipse.org/projects/ee4j.jaxrs), the spec group is already actively [working on version 2.2 and thinking about the following ones](https://github.com/eclipse-ee4j/jaxrs-api/wiki/Roadmap). RESTEasy will definitely implement the latest versions on master (we actually have a prototype of the new _SE boostrap API_ ready since months); the backport to 3.x stream will have to be coordinated with WildFly efforts around JakartaEE upgrades.

## MicroProfile ##

RESTEasy is implementing [MicroProfile REST Client](https://microprofile.io/project/eclipse/microprofile-rest-client) 1.3 and will be updating to new versions should they be produced by the spec working group. Besides that, we have plans for improving the integration of some of the other MicroProfile technologies in RESTEasy (OpenAPI, OpenTracing, Config). The efforts are possibly going to be on both master and 3.x: as Brian recently announced, [MicroProfile is going to be a significant focus for the next couple of WildFly releases](https://wildfly.org/news/2019/10/03/WildFly18-Final-Released/).

## Quarkus integration improvements ##

I foresee multiple contributions and request for enhancements coming from the [Quarkus](https://quarkus.io/) land in the very next future. A few examples of possible improvements would be the support for non-blocking IO on server side and possibly an abstraction layer for the access to annotations, to avoid RESTEasy performing a lot of annotation scanning at runtime.

## WildFly integration improvements ##

In addition to the JakartaEE and MicroProfile efforts mentioned above, we still have a few new features that were planned for previous WildFly releases but haven&#39;t been completed yet. I&#39;m thinking about exposing statistics for RESTEasy resources in the WildFly management model and possibly adding a new module for WADL support. 

That&#39;s it for now, I promise I will try to update you on the plans in the future!

_Stay tuned ... and keep on contributing!_





                    




                    

                    


                
