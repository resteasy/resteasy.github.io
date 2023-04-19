---
layout:     post
title:       "The UndertowJaxrsSpringServer"
subtitle:   ""
date:       Mar 13, 2019 12:48:00 A
author:     Weinan Li
---

Recently I’m working on migrating `resteasy-spring` tests to use the Undertow container. Before these tests were using the TJWS embedded container. 

As `resteasy-tjws` container is deprecated in master, so there is some work to be done to make undertow container to load the `resteasy-spring` components correctly.

In order to achieve the goal, I created a new module called `resteasy-undertow-spring`, and it contains a single class called `UndertowJaxrsSpringServer`.

This server class will accept the spring xml configuration file, and load the configured spring context beans into spring provided `org.springframework.web.servlet.DispatcherServlet`. Here is the relative code in `UndertowJaxrsSpringServer`: 

```
ServletInfo servlet =
    servlet(SERVLET_NAME, DispatcherServlet.class)
          .setLoadOnStartup(1)
          .addInitParam("contextConfigLocation", contextConfigLocation)
          .addMapping(mapping);
```

In addition, the `resteasy-spring` module contains a default xml configuration file called `springmvc-resteasy.xml`, and it can be used by default to setup the `resteasy-spring` component properly.
So users just need to prepare their own spring config file and include the `springmvc-resteasy.xml` to load the `resteasy-spring` module. Here is a minimal example of the config:
```
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
        http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-2.5.xsd
        http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-2.5.xsd
        http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
        ">
    <context:component-scan base-package="org.jboss.resteasy.springmvc.test"/>
    <context:annotation-config/>
    <import resource="classpath:springmvc-resteasy.xml"/>
</beans>
```
In above config, we can see it includes the `springmvc-resteasy.xml` provided by `resteasy-spring` module, and it will scan the `org.jboss.resteasy.springmvc.test` package to include the user-written jaxrs resources.

And here is the code to setup the `UndertowJaxrsSpringServer` and start it: 
```
UndertowJaxrsSpringServer server = new UndertowJaxrsSpringServer();

server.start();

DeploymentInfo deployment = server.undertowDeployment("classpath:spring-servlet.xml", null);
deployment.setDeploymentName(BasicSpringTest.class.getName());
deployment.setContextPath("/");
deployment.setClassLoader(BasicSpringTest.class.getClassLoader());

server.deploy(deployment);
```
The above code is part of the tests in `resteasy-undertow-spring`, and the tests can be used as usage example:


[Resteasy/BasicSpringTest.java at master · resteasy/resteasy · GitHub](https://github.com/resteasy/resteasy/blob/master/server-adapters/resteasy-undertow-spring/src/test/java/org/jboss/resteasy/springmvc/test/client/BasicSpringTest.java)


And the tests shows more advanced spring configurations that can be used as reference.




                    




                    

                    


                
