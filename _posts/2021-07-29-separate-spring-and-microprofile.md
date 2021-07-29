---
layout:     post
title:       "Separating RESTEasy Spring And Microprofile Components Into Independent Subprojects."
subtitle:   ""
date:       July 29, 2021
author:     Wei Nan Li
---

Currently we are doing the task of separating RESTEasy Spring and Microprofile components into independent sub-projects, and here are the sub-projects we are working on:

- https://github.com/resteasy/resteasy-spring
- https://github.com/resteasy/resteasy-microprofile

There are several reasons to do this:

- These Spring and Microprofile components are relatively independent from the main project, so moving them into their separate sub-projects makes them more independent and make their release cycles more flexible.
- The main RESTEasy project is under the process of migrating from JavaEE namespaces to JakartaEE namespaces, and these Microprofile and Spring components have some impacts on the work, so it is better maintaining them into their separate projects.
- Currently there are dependencies in the main project just maintained for these components. So making them as independent sub-projects can also move out these outside dependencies into their sub-projects, which release the burden of the main project maintaining work, and also increase the speed of main project build cycle.

Currently the work in progress we are doing:

- Created `resteasy-spring` and `resteasy-microprofile` sub-projects(link listed above).
- `resteasy 4.7.1.Final` is released: [Release 4.7.1.Final · resteasy/Resteasy · GitHub](https://github.com/resteasy/Resteasy/releases/tag/4.7.1.Final)
- `resteasy-spring 1.0.0.Final` is released: [Release v1.0.0.Final · resteasy/resteasy-spring · GitHub](https://github.com/resteasy/resteasy-spring/releases/tag/1.0.0.Final)

There are some notes to take in above work:

* The reason to release `resteasy 4.7.1.Final` is to upload all the artifacts inside the main project. For some historical reasons we didn’t upload all the artifacts in previous versions(`arquillian-utils` for example). But as Spring and Microprofile components are moving into their own sub-projects, these missing uploaded components are used as dependencies. Besides there maybe some other projects may need them, so from `4.7.1.Final` and moving forward we will upload all the artifacts in the RESTEasy main project.
* `resteasy-spring 1.0.0.Final` is released and already uploaded to maven repo: [Maven Repository: org.jboss.resteasy.spring](https://mvnrepository.com/artifact/org.jboss.resteasy.spring). We haven’t changed the package names or code structures inside these components, but just rename the `groupId` in `pom.xml`, which changes from `org.jboss.resteasy` to `org.jboss.resteasy.spring`.
* `resteasy-microprofile` is not yet released. Components `resteasy-client-microprofile-base`
and `resteasy-client-microprofile` have been moved into this project and renamed `rest-client-base`
and `rest-client` respectively. Their package names and code structures remain the same.
The groupId for the components has changed from `org.jboss.resteasy` to `org.jboss.resteasy.microprofile`.
A BOM file is provided for this project. It's GAV is `org.jboss.resteasy.microprofile:resteasy-microprofile-bom`.


In addition, we are currently working on using [Galleon Feature Pack](https://docs.wildfly.org/galleon/) solution to replace the current [jboss-modules](https://github.com/resteasy/Resteasy/tree/main/jboss-modules) structure. The reason to do this is that the current `jboss-module`  solution for WildFly integration is too heavy and not flexible enough, so Galleon is a better approach for WildFly integration(more details of Galleon can see this article:  [Ship Your WildFly Additions via Galleon Feature Packs](https://www.wildfly.org/news/2019/12/17/Ship-your-WildFly-additions-via-Galleon-feature-packs/)). There some work in progress for this task:

- [GitHub - jamezp/resteasy-microprofile at feature-pack](https://github.com/jamezp/resteasy-microprofile/tree/feature-pack)
- [re-enable tests by liweinan · Pull Request #5 · resteasy/resteasy-spring · GitHub](https://github.com/resteasy/resteasy-spring/pull/5)

In the future we plan to use this solution for the whole RESTEasy project.

This article does not cover all the details we are doing, for example we need to update the project docuemnts, announcing these changes, and cover more code and test changes.

Let’s move on!
