---
layout:     post
title:       "RESTEasy 4 is coming soon"
subtitle:   ""
date:       Mar 28, 2019 4:25:34 AM
author:     Alessio Soldano
---

Earlier this week a release candidate version (4.0.0.CR1) of [RESTEasy](https://resteasy.github.io/) has been tagged. The artifacts are built and available on the Maven Central and JBoss Nexus repositories.

This is the result of many months of work on RESTEasy master branch in parallel with the continuous enhancements and maintenance on the 3.x stream ; below I&#39;m highligthing some of the areas on which the team has been focussing. 

## Major cleanup ##

During last 2 years, we have spent a lot of energies in getting rid of not-needed anymore (or deprecated) classes, components, dependencies and such. As an example, RESTEasy 3 still included the old RESTEasy 2 client implementation pre-dating the JAX-RS 2 spec client; clearly, that&#39;s deprecated since years and possibly even confusing users; with RESTEasy 4 it&#39;s gone. Similarly, old and deprecated modules have been dropped, including:

*   the Jettison, Jackson 1 (org.codehaus one), Abdera and YAML providers
*   the Netty 3 server adapter
*   the RxJava (1) integration
*   the TJWS embedded server
*   few security modules duplicating [Keycloak](https://www.keycloak.org/) services.

## Code restructure and optimizations ##

Together with the removal of old cruft, we&#39;ve made some progress in restructuring the project in a way that:

1.  allows running with JDK9+ (JDK11 tested at the time of writing) and the JPMS module system (as an example, we had multiple packages split between different modules that had to be dealt with);
2.  allows clearly figuring out whether a given class is to be considered as part of RESTEasy public API or not.

This clearly resulted in a lot of refactoring, with some classes that had to be moved. We tried to cause as less disruption as possible with the changes, still few non-backward compatible changes had to be performed and are going to be documented in a migration guide to be prepared before releasing 4.0.0.Final. Regarding the second goal above, the big _resteasy-jaxrs_ and _resteasy-client_ modules have been split into _resteasy-core-spi, resteasy-client-api, resteasy-core_ and _resteasy-client_, with the first and second ones to be considered as public modules, for which we&#39;re expected to retain backward compatibility till next major release.

The reason for the refactoring aimed at the public/private module separation is of course easier future maintenance; however, we also did some refactoring for optimizing few parts of the project that we knew as problematic performance-wise. That&#39;s the case of the _ResteasyProviderFactory_ class, which has grown a lot year after year and had a lot of state info being copied over and over for most common usage scenarios, badly increasing memory pressure. In RESTeasy 4, when a _ResteasyProviderFactory_ instance is known to be needed for client usage only, the server side specific data is not computed and stored; the opposite happening for server-side only scenarios, with a nice memory allocation reduction. 

## New features  ##  

RESTEasy 4 is coming with all the features, fixes and upgrades that went into the 3.x releases (
350+ jira issues have been solved
). To name some of the recent additions, that includes the JAX-RS 2.1 implementation, the Reactive programming support, the new HTTP client engines (including NIO), etc.

On top of that, there&#39;re few additions that could not be backported to 3.x branches and are new in RESTEasy 4:

*   [Upgrade to Mime4j 0.7.x](https://issues.jboss.org/browse/RESTEASY-754)
*   [RESTEasy Tracing feature](https://issues.jboss.org/browse/RESTEASY-1418)
*   [RESTEasy Spring - Undertow](https://issues.jboss.org/browse/RESTEASY-2009) server adapter integration
*   [MicroProfile Config integration](https://issues.jboss.org/browse/RESTEASY-2131)
*   [Builtin ParamConverter* classes for multi valued params](https://issues.jboss.org/browse/RESTEASY-1996)
*   [Asynchronous Injection](https://issues.jboss.org/browse/RESTEASY-1905)

## Quarkus  ##

While RESTEasy 3 main integration targets are [WildFly](https://wildfly.org/) and [JBoss EAP](https://www.redhat.com/it/technologies/jboss-middleware/application-platform) 7.x, when the efforts for RESTEasy 4 were started we had no clear idea of which container would have been consuming the project, so we thought we would have targeted standalone usage of RESTEasy. The reason for that clearly were WildFly and JBoss EAP coming with strict rules around backward compatibility and RESTEasy 4 not being able to satisfy them (because of the changes explained above and considering his historical deficiencies in terms of public/private classes separation).

However, when the work on Protean (now [Quarkus](https://quarkus.io/)) started, it became evident that RESTEasy 4 was well positioned for being included in the new stack, especially considering our efforts on reducing the memory footprint and getting rid of useless / old classes while retaining modern functionalities like the reactive programming support. As a consequence, Quarkus has been launched including RESTEasy 4 beta and few days ago I&#39;ve [upgraded it to pull 4.0.0.CR1](https://github.com/quarkusio/quarkus/pull/1667).


So, it&#39;s definitely time to give RESTEasy 4 CR1 a try! There&#39;re multiple ways you can play with it:

*   in Quarkus, either waiting for next week release or building the latest sources from [github master](https://github.com/quarkusio/quarkus); note, there&#39;s a nice quickstart pulling RESTEasy too in the [Quarkus Getting Started Guide](https://quarkus.io/guides/getting-started-guide) ;-)
*   standalone, by simply pulling the 4.0.0.CR1 artifacts as dependencies in your Maven project
*   on WildFly 16, by patching its modules (if you can cope with the few API changes we did) with the contents of our jboss-modules module, after having built it from the [sources on github](https://github.com/resteasy/Resteasy/tree/4.0.0.CR1).

Hopefully, unless something critical is spotted or reported, we&#39;ll be releasing Final (including proper documentation) in few weeks from now.

Stay tuned!




                    




                    

                    


                
