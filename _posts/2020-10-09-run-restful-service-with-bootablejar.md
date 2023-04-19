---
layout:     post
title:      "Restful service with bootable jar"
subtitle:   ""
date:       Oct 21, 2020
author:     Jim Ma
---

WildFly provides another very easy to use tool to package your application and whole WildFly server in a jar file to help you implement/deploy MicroService. Like the uber or fat jar approach, whole application can be started with one command line:
```
   java -jar myapp-bootable.jar
```
The WildFly sever packaged in this bootable jar file is not a big size one which contains a lot of things your application doesn't need. Thanks for [Galleon](https://docs.wildfly.org/galleon/), it brings the capability to customize the WildFly server installation with different [layers](https://docs.wildfly.org/20/Admin_Guide.html#defined-galleon-layers). In this post, we'll introduce how to use this new tool [wildfly-jar-maven-plugin](https://github.com/wildfly-extras/wildfly-jar-maven-plugin) to package all things in a bootable jar.

### wildfly-jar-plugin Configuration

The WildFly jar plugin tool is developed to work with WildFly since version 20.0.0.Final. Now the latest WildFly jar plugin version is 2.0.0.Final. It's just released alone with WildFly 21.0.0.Final. The goal of this maven plugin is package the Jakarta EE application with server installation with galleon layer provisioning in a bootable jar. WildFly server arguments can be passed to this bootable jar to define the binding address or other property to start WildFly server. Below is the whole support arguments list:
```
java -jar helloworld-bootable.jar --help

Usage: java -jar <bootable jar> [args...]
where args include:
    --deployment=<value>                Path to deployment artifact 
                                        (war,jar,ear or exploded deployment 
                                        dir) to deploy in hollow jar

    -b=<value>                          Set system property jboss.bind.address 
                                        to the given value

    -b<interface>=<value>               Set system property 
                                        jboss.bind.address.<interface> to the 
                                        given value

    -D<name>[=<value>]                  Set a system property

    --display-galleon-config            Display the content of the Galleon 
                                        configuration used to build this 
                                        bootable JAR

    --help                              Display this message and exit

    --install-dir=<value>               Path to directory in which the server 
                                        is installed. By default the server is 
                                        installed in TEMP directory.

    --properties=<url>                  Load system properties from the given 
                                        url

    -secmgr                             Activate the SecurityManager

    -S<name>[=<value>]                  Set a security property

    -u=<value>                          Set system property 
                                        jboss.default.multicast.address to the 
                                        given value

    --version                           Print version and exit
```
From the argument list, the ```--install-dir``` defines the location the unzipped WildFly server from this bootable jar file. By default, directory /tmp(on Linux) is the place where WildFly server unzipped:
```
 wildfly-bootable-server6990124907254246716
 wildfly-bootable-server7488244112163926076
 wildfly-bootable-server8368048731434793592
```

wildfly-jar-plugin supports WildFLY CLI script to do more customization/configuration work for your server during package. If your application needs to configure the security or logging subsystem, the ```<cli-session>``` is the item to configure:
```
                <groupId>org.wildfly.plugins</groupId>
                <artifactId>wildfly-jar-maven-plugin</artifactId>
                <configuration>
                    <cli-sessions>
                        <cli-session>
                            <script-files>
                                <script>../scripts/logging-log4j-appender.cli</script>
                            </script-files>
                            <properties-file>../scripts/cli.properties</properties-file>
                            <resolve-expressions>false</resolve-expressions>
                        </cli-session>
                    </cli-sessions>
``` 

To trim the server installation size and package into bootable jar, galleon layer can be defined to include different WildFly server subsystem and relevant jboss modules. In this example, we only need to deploy and start Restful service, so ```jaxrs``` layer is required and ```management``` is the plus layer to support server management with CLI or GUI. Put all configuration items, this is the configuration to create the bootable jar for restful service:
```
            <plugin>
                <groupId>org.wildfly.plugins</groupId>
                <artifactId>wildfly-jar-maven-plugin</artifactId>
                <version>${version.bootable.jar}</version>
                <configuration>
                    <feature-pack-location>wildfly@maven(org.jboss.universe:community-universe)#${version.wildfly}</feature-pack-location>
                    <layers>
                        <layer>jaxrs</layer>
                        <layer>management</layer>
                    </layers>
                    <excluded-layers>
                        <layer>deployment-scanner</layer>
                    </excluded-layers>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>package</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
```
```deployment-scanner``` is excluded because the server doesn't need to scan the deployment with bootable jar start approach.  

### Package the application with wildfly-jar-plugin

Package application to bootable jar is very simple with wildfly-jar-plugin. The only thing need to do is adding this plugin to maven or gradle project and properly configure it. But the first, make sure your project build output is a war or ear file. We have an maven example project and build output is war deployment. 
The maven pom.xml before add the wildfly-jar-plugin is something like:
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.resteasy.bootable</groupId>
    <artifactId>helloworld</artifactId>
    <version>1.0.0.Beta1</version>
    <packaging>war</packaging>

    <name>RESTEasy Bootable JAR Example</name>
    <description>An bootable jaxrs jar</description>
    <properties>
        <version.jakartaee>8.0.0</version.jakartaee>
    </properties>
    <dependencies>
        <dependency>
            <groupId>jakarta.platform</groupId>
            <artifactId>jakarta.jakartaee-api</artifactId>
            <version>${version.jakartaee}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-war-plugin</artifactId>
                    <configuration>
                        <failOnMissingWebXml>false</failOnMissingWebXml>
                    </configuration>
                </plugin>
        </plugins>
    </build>
</project>
```
Here we have an simple example to demonstrate start service with a bootable jar. In this service, there is simple product resource class to generate json result for products query request:
```
package org.resteasy.bootablejar;
import javax.ws.rs.Path;
import javax.ws.rs.GET;
import javax.ws.rs.Produces;
@Path("/products")
public class Jackson2Resource {
   @GET
   @Produces("application/json")
   public Jackson2Product[] getProducts() {

      Jackson2Product[] products = {new Jackson2Product(111, "JBoss EAP"),
            new Jackson2Product(222, "RHEL"), new Jackson2Product(333, "CentOS")};
      return products;
   }
}
```
More details please visit [resteasy-bootable-jar-example]https://github.com/resteasy/resteasy-examples/tree/master/bootable-jar)

After the wildfly-jar-plugin is added and configured, it will have all things to generates the bootable jar file along with this war deployment. 

### Run bootable jar

Besides the ```java -jar target/products-runner-bootable.jar``` to start this product service server,  there are another two wildfly-jar-plugin goals to start: 
```mvn wildfly-jar:run``` with blocking mode or  ```mvn wildfly-jar:start``` to start the server in background.

After the sever is started, prouducts json result will be returned for http GET request ```http://localhost:8080/products``` :

```
[{"id":111,"name":"JBoss EAP"},{"id":222,"name":"RHEL"},{"id":333,"name":"CentOS"}]
```
### Conclusion

wildfly-jar-plugin is the another good tool WildFly team created after galleon layer. With this tool, create the bootable jar file with small size for the old JakartaEE or JEE application is much easier. If you want to evolve your old JaxRS application to MicroService or move to the cloud or container, please add this plugin to your current maven or gradle project and give it a try.

### Resources

* [resetasy-bootable-jar example](https://github.com/resteasy/resteasy-examples/tree/master/bootable-jar)

* [wildfly-jar-plugin introduction blog](https://www.wildfly.org/news/2020/06/18/Bootable-jar-Wildfly-20/)

* [wildfly-jar-plugin project](https://github.com/wildfly-extras/wildfly-jar-maven-plugin)

* [wildfly-jar-plugin documentation](https://github.com/wildfly-extras/wildfly-jar-maven-plugin/releases/download/2.0.0.Alpha4/index.html)

















