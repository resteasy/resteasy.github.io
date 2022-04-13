---
layout:     post
title:      "RESTEasy Spring And RESTEasy Spring Boot EE9 Deployment With WildFly Preview"
subtitle:   ""
date:       2022-04-14
author:     Wei Nan Li
---

Both Spring 6 and RESTEasy 6 adopts EE9 spec and namespaces, and there are releases of `resteasy-spring` that adopts the Spring and RESTEasy 6:

- [https://github.com/resteasy/resteasy-spring/releases/tag/3.0.0.Alpha1](https://github.com/resteasy/resteasy-spring/releases/tag/3.0.0.Alpha1)

To show how to use this version of `resteasy-spring` with the preview version of WildFly(which also supports EE9 spec), I have committed to the `resteasy-spring-basic` example showing how to do this:

- [resteasy-examples/resteasy-spring-basic at main · resteasy/resteasy-examples · GitHub](https://github.com/resteasy/resteasy-examples/tree/main/resteasy-spring-basic)

Please read the README of the sample project to see how to use it:

- [https://github.com/resteasy/resteasy-examples/tree/main/resteasy-spring-basic#deploying-the-project-to-wildfly](https://github.com/resteasy/resteasy-examples/tree/main/resteasy-spring-basic#deploying-the-project-to-wildfly)

The above example shows how to deploy the EE9 based project into WildFly Preview Distribution.

In addition, the `resteasy-spring-boot` project also supports EE9 now, please check its sample project for its usage:

- [https://github.com/resteasy/resteasy-spring-boot/tree/main/sample-app-for-wildfly](https://github.com/resteasy/resteasy-spring-boot/tree/main/sample-app-for-wildfly)

Enjoy!
