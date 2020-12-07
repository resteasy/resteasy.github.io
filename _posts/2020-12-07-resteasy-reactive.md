---
layout:     post
title:       "Introducing RESTEasy Reactive"
subtitle:   ""
date:       Dec 07, 2020 02:30:00 PM
author:     Alessio Soldano
---
The RESTEasy community has been very active during the last two years and the project has seen a lot of improvements and additions. In addition to the usual standalone and [WildFly](https://www.wildfly.org/) related usage scenarios, we've seen a lot of interest coming from the [Quarkus](https://quarkus.io/) community, due to RESTEasy providing the base REST engine in it. The result has been RESTEasy 4 series starting embracing reactive, with innovation going beyond the few additions mandated by the JAX-RS 2.1 specification. Quarkus has benefited from this and succeeded in continuing offering JAX-RS ([Jakarta RESTful Web Services](https://projects.eclipse.org/projects/ee4j.jaxrs) today) API for building its REST services.

However, we've now reached the point where further scaling up to increase the performances in Quarkus requires re-thinking of the core REST engine. Hence here we are introducing *RESTEasy Reactive*, a new JAX-RS implementation written from the ground up to work on top of Quarkus' *Vert.x* layer and is thus fully reactive, while also being very tightly integrated with Quarkus and consequently moving a lot of framework specific work (like annotation scanning and metamodel generation) to build time.
You can read a lot of interesting details on RESTEasy Reactive on the [announcement post](https://quarkus.io/TBD) in the Quarkus blog. As you can see, the new project is currently considered experimental, is living in the Quarkus [repository](https://github.com/quarkusio/quarkus/tree/master/independent-projects/resteasy-reactive) and should be pulled through new extensions in one of the future Quarkus releases. Moving forward, RESTEasy Reactive is migrating to the existing RESTEasy [repository](https://github.com/resteasy/resteasy-reactive/) and we plan to leverage any possible synergies among the projects (sharing fixes, porting features back and forth, etc).
RESTEasy Reactive is currently tailored to the very specific Quarkus needs and takes opinionated choices on the specification requirement and functionalities in general to support, to maximize performance and simplify evolution and innovation. Depending on the interest and success in Quarkus, we might consider refactoring RESTEasy Reactive to allow it running outside of Quarkus as well.

Very interesting times are ahead of us, with innovation coming from both RESTEasy Reactive and RESTEasy "Classic" sides (*MicroProfile REST Client 2* and *Jakarta RESTful Web Services 3* being just two examples).
*Stay tuned!*
