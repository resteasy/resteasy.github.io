---
layout:     post
title:      "Using the resteasy-grpc feature together with the WildFly gRPC subsystem"
subtitle:   ""
date:       2023-09-12
author:     Wei Nan Li
---


`resteasy-grpc`[^resteasy-grpc] is a project that can help you to generate a bridge project that can expose REST service APIs to gRPC clients. The `resteasy-grpc` generated project will wrap your REST project into the final bridge project, and provide a gRPC service by using the standard gRPC server by default, and redirect the gRPC service calls into the backend servlet based REST services internally, which means you need to have a servlet container so the backend REST services are online.

In this article, I’ll show you how to deploy the bridge project into WildFly. The reason to use WildFly is that it has a gRPC subsystem, and it is also a servlet container out of box, so it’s very convenient to deploy the bridge project into it. Now let’s go to the details.

The first step is to clone the `resteasy-examples`[^resteasy-examples] project:

```bash
$ git clone git@github.com:resteasy/resteasy-examples.git
```

In the example project it has a `grpc-bridge-example`, and we will use this example to show the usage of `resteasy-grpc` in this article. Secondly we need to build this project:

```bash
➤ pwd                                                                                                                                                         18:07:53
/Users/weli/works/resteasy-examples/grpc-bridge-example
```

```bash
$ mvn install -DskipTests
...
[INFO] --- maven-war-plugin:3.2.3:war (default-war) @ grpcToRest.example ---
[INFO] Packaging webapp
[INFO] Assembling webapp [grpcToRest.example] in [/Users/weli/works/resteasy-examples/grpc-bridge-example/target/grpcToRest.example-1.0.1.Final-SNAPSHOT]
[INFO] Processing war project
[INFO] Webapp assembled in [25 msecs]
[INFO] Building war: /Users/weli/works/resteasy-examples/grpc-bridge-example/target/grpcToRest.example-1.0.1.Final-SNAPSHOT.war
[INFO]
[INFO] --- maven-source-plugin:3.1.0:jar-no-fork (attach-sources) @ grpcToRest.example ---
[INFO] Building jar: /Users/weli/works/resteasy-examples/grpc-bridge-example/target/grpcToRest.example-1.0.1.Final-SNAPSHOT-sources.jar
[INFO]
[INFO] --- maven-install-plugin:2.5.2:install (default-install) @ grpcToRest.example ---
[INFO] Installing /Users/weli/works/resteasy-examples/grpc-bridge-example/target/grpcToRest.example-1.0.1.Final-SNAPSHOT.war to /Users/weli/.m2/repository/dev/resteasy/examples/grpcToRest.example/1.0.1.Final-SNAPSHOT/grpcToRest.example-1.0.1.Final-SNAPSHOT.war
[INFO] Installing /Users/weli/works/resteasy-examples/grpc-bridge-example/pom.xml to /Users/weli/.m2/repository/dev/resteasy/examples/grpcToRest.example/1.0.1.Final-SNAPSHOT/grpcToRest.example-1.0.1.Final-SNAPSHOT.pom
[INFO] Installing /Users/weli/works/resteasy-examples/grpc-bridge-example/target/grpcToRest.example-1.0.1.Final-SNAPSHOT-sources.jar to /Users/weli/.m2/repository/dev/resteasy/examples/grpcToRest.example/1.0.1.Final-SNAPSHOT/grpcToRest.example-1.0.1.Final-SNAPSHOT-sources.jar
...
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.254 s
[INFO] Finished at: 2023-07-31T18:08:42+08:00
[INFO] ------------------------------------------------------------------------
```

Now we have built the example project and installed the `grpcToRest.example-1.0.1.Final-SNAPSHOT.war` locally. According to the `README`[^example-readme] of the example project, now we can start to build the bridge project. To build the bridge project, we need to change our working directory outside the example project, and better to find a blank directory to do the project generation. In my local environment, I created an empty directory to do this:

```bash
➤ pwd
/Users/weli/works
weli@192:~/works
➤ mkdir play-grpc
weli@192:~/works
➤ cd play-grpc/
weli@192:~/w/play-grpc
```

As the command output shown above, I created a 'play-grpc' directory and entered the directory. Then I run the following command to generate the bridge project:

```bash
$ mvn archetype:generate -B \
         -DarchetypeGroupId=dev.resteasy.grpc \
         -DarchetypeArtifactId=gRPCtoJakartaREST-archetype \
         -DarchetypeVersion=1.0.0.Alpha5 \
         -DgroupId=dev.resteasy.examples \
         -DartifactId=grpcToRest.example \
         -Dversion=1.0.1.Final-SNAPSHOT \
         -Dgenerate-prefix=Greet \
         -Dgenerate-package=org.greet \
         -Dresteasy-version=6.2.4.Final \
         -Dgrpc-bridge-version=1.0.0.Alpha2
```

The above command uses the archetype provides by this project:

- [resteasy/gRPCtoJakartaREST-archetype: Archetype for building a gRPC to JAX-RS bridge](https://github.com/resteasy/gRPCtoJakartaREST-archetype)

And it will generate the bridge project according to the above example project, because we have set the GAV of the built example project in above command, and it will automatically copy the Java sources files from the local installed example project WAR file and parse the classes inside to generate the bridge project. The output of the above command is shown in below:

```bash
[INFO] ----------------------------------------------------------------------------
[INFO] Using following parameters for creating project from Archetype: gRPCtoJakartaREST-archetype:1.0.0.Alpha5
[INFO] ----------------------------------------------------------------------------
[INFO] Parameter: groupId, Value: dev.resteasy.examples
[INFO] Parameter: artifactId, Value: grpcToRest.example
[INFO] Parameter: version, Value: 1.0.1.Final-SNAPSHOT
[INFO] Parameter: package, Value: dev.resteasy.examples
[INFO] Parameter: packageInPathFormat, Value: dev/resteasy/examples
[INFO] Parameter: package, Value: dev.resteasy.examples
[INFO] Parameter: resteasy-version, Value: 6.2.4.Final
[INFO] Parameter: generate-prefix, Value: Greet
[INFO] Parameter: groupId, Value: dev.resteasy.examples
[INFO] Parameter: artifactId, Value: grpcToRest.example
[INFO] Parameter: grpc-bridge-version, Value: 1.0.0.Alpha2
[INFO] Parameter: generate-package, Value: org.greet
[INFO] Parameter: version, Value: 1.0.1.Final-SNAPSHOT
[INFO] Project created from Archetype in dir: /Users/weli/works/trytry/grpcToRest.example
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.231 s
[INFO] Finished at: 2023-07-31T18:40:27+08:00
[INFO] ------------------------------------------------------------------------
```

After everything goes fine, we get a generated bridge project:

```bash
$ ls
grpcToRest.example
```

The above generated project doesn’t have many files inside:

```bash
$ tree
├── pom.xml
└── src
    ├── main
    │   ├── resources
    │   │   ├── buildjar
    │   │   └── deployjar
    │   └── webapp
    │       ├── META-INF
    │       │   └── beans.xml
    │       └── WEB-INF
    │           └── web.xml
    └── test
        └── java

8 directories, 5 files
```

Now we can build this bridge project, and it will generate a lot of files for us. Here is the command to do so:

```bash
$ mvn install
```

After the above installation process is done, we can see the generated files. Firstly we can see the generated source files:

```bash
weli@ovpn-12-142:~/w/t/grpcToRest.example
➤ tree src
src
├── main
│   ├── java
│   │   ├── GreetingTest
│   │   ├── META-INF
│   │   │   ├── INDEX.LIST
│   │   │   ├── MANIFEST.MF
│   │   │   └── maven
│   │   │       └── dev.resteasy.examples
│   │   │           └── grpcToRest.example
│   │   │               ├── pom.properties
│   │   │               └── pom.xml
│   │   └── dev
│   │       └── resteasy
│   │           └── example
│   │               └── grpc
│   │                   └── greet
│   │                       ├── GeneralGreeting.java
│   │                       ├── Greeter.java
│   │                       └── Greeting.java
│   ├── proto
│   │   └── Greet.proto
│   ├── resources
│   │   ├── buildjar
│   │   └── deployjar
│   └── webapp
│       ├── META-INF
│       │   └── beans.xml
│       └── WEB-INF
│           └── web.xml
└── test
    └── java

18 directories, 13 files
```

From the above output, we can see in the `src` directory the Java classes are copied from the origin example project, and there is a generated `Greet.proto` file. In addition, there are many files generated inside the `target` directory:

```
➤ tree target/generated-sources/
target/generated-sources/
├── annotations
└── protobuf
    ├── grpc-java
    │   └── org
    │       └── greet
    │           ├── GreetJavabufTranslator.java
    │           ├── GreetMessageBodyReaderWriter.java
    │           ├── GreetServiceGrpc.java
    │           ├── GreetServiceGrpcImpl.java
    │           └── Greet_Server.java
    └── java
        └── org
            └── greet
                └── Greet_proto.java

8 directories, 6 files
```

The above files are generated by the `resteasy-grpc` project(And part of the code is generated from the .proto file by the gRPC Java project by itself, which we won’t discuss the details here).

>  Note: Among these generated classes, the `Greet_Server` will start a standalone gRPC server, which is backend by the standard `io.grpc` server. However the WildFly server has its own gRPC subsystem, and it will automatically detect our gRPC bridge project and start a gRPC service at port `9990`, so we won’t use this method in this article. We will, however, use the `startContext()` method.

The above installation process will generate a war file:

```bash
➤ pwd
/Users/weli/works/grpcToRest.example/target
```

```bash
weli@ovpn-12-142:~/w/g/target|main⚡*?
➤ ls *.war
grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war
```

> Note: I have put the generated bridge project [here](https://github.com/liweinan/grpcToRest.example) if you want to check for reference.

We will use the above generated WAR file to deploy it to a provisioned WildFly server. The next step is to install a provisioned WildFly server with gRPC subsystem installed. In the `README`[^example-readme] of the example project, it describes how to use Galleon CLI[^galleon](Please check the Galleon website to see how to install this tool) to do the installation. In brief, to install the provisioned WildFly, use the following commands to do so:

```bash
galleon.sh install wildfly:current --dir=wildfly
galleon.sh install org.jboss.resteasy:galleon-feature-pack:6.2.4.Final --dir=wildfly --ignore-not-excluded-layers=true
galleon.sh install org.wildfly.extras.grpc:wildfly-grpc-feature-pack:0.1.1.Final --layers=grpc --dir=wildfly
```

If everything goes fine, we have a provisioned WildFly server installed:

```bash
weli@ovpn-12-142:~/w/g/wildfly
➤ ls
LICENSE.txt		appclient		copyright.txt		domain			modules			welcome-content
README.txt		bin			docs			jboss-modules.jar	standalone
```

Now we can start this provisioned WildFly server with the following command:

```bash
weli@ovpn-12-142:~/w/g/wildfly
➤ cd bin
weli@ovpn-12-142:~/w/g/w/bin
➤ ./standalone.sh
```

After the WildFly server is started, we can deploy the bridge with the following command:

```bash
weli@ovpn-12-142:~/w/g/w/bin
➤ ./jboss-cli.sh --connect
[standalone@localhost:9990 /] deploy /Users/weli/works/grpcToRest.example/target/grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war --force
```

The above command uses the `jboss-cli.sh` tool to deploy the bridge project. If everything goes fine, the server output will be like this:

```
19:52:34,512 INFO  [org.jboss.as.repository] (management-handler-thread - 1) WFLYDR0001: Content added at location /Users/weli/works/grpc-wildfly-galleon-feature-dist/wildfly/standalone/data/content/17/4a91ab123ec2ac0c60da7c222c3793e445aaf1/content
19:52:34,514 INFO  [org.jboss.as.server.deployment] (MSC service thread 1-8) WFLYSRV0027: Starting deployment of "grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war" (runtime-name: "grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war")
19:52:34,787 WARN  [org.jboss.as.dependency.private] (MSC service thread 1-4) WFLYSRV0018: Deployment "deployment.grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war" is using a private module ("org.wildfly.extension.grpc") which may be changed or removed in future versions without notice.
19:52:34,787 WARN  [org.jboss.as.dependency.private] (MSC service thread 1-4) WFLYSRV0018: Deployment "deployment.grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war" is using a private module ("io.grpc") which may be changed or removed in future versions without notice.
19:52:34,790 INFO  [org.jboss.weld.deployer] (MSC service thread 1-6) WFLYWELD0003: Processing weld deployment grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war
19:52:34,955 INFO  [org.wildfly.extension.undertow] (ServerService Thread Pool -- 90) WFLYUT0021: Registered web context: '/grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT' for server 'default-server'
19:52:34,977 INFO  [org.jboss.as.server] (management-handler-thread - 1) WFLYSRV0010: Deployed "grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war" (runtime-name : "grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT.war")
```

The deployment will do two things: Firstly the original example REST service in the bridge project will be detected by WildFly and start to service. Secondly the gRPC subsystem in WildFly will detect the generated `GreetServiceGrpc` automatically and start to service the gRPC bridge APIs at port `9555` by default.

Now we can try to access the REST service directly:

```bash
➤ curl 'http://localhost:8080/grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT/grpcToJakartaRest/greet/Bill'


hello, Bill⏎ 
```


From above command output we can verify the REST service itself is working. The next step we can try to access the bridged gRPC service instead of directly calling the above REST service. Before this, we can check the `grpc` subsystem inside the WildFly server. To do this, we can use the `jboss-cli.sh` command provided in the `bin` directory of the provisioned WildFly directory to connect to the WildFly server. Here is the command to do so:

```bash
weli@192:~/w/g/w/bin
➤ pwd                                                                                                                                                         00:08:12
/Users/weli/works/grpc-wildfly-galleon-feature-dist/wildfly/bin
weli@192:~/w/g/w/bin
➤ ./jboss-cli.sh --connect                                                                                                                                    00:08:13
[standalone@localhost:9990 /]
```

After entering the management interface and connected to the WildFly server, we can list the subsystems like this:

```bash
[standalone@localhost:9990 /] ls subsystem=
batch-jberet                  ee                            io                            mail                          resource-adapters
bean-validation               ee-security                   jaxrs                         metrics                       sar
core-management               ejb3                          jca                           microprofile-config-smallrye  security-manager
datasources                   elytron                       jdr                           microprofile-jwt-smallrye     transactions
deployment-scanner            elytron-oidc-client           jmx                           naming                        undertow
discovery                     grpc                          jpa                           pojo                          webservices
distributable-ejb             health                        jsf                           remoting                      weld
distributable-web             infinispan                    logging                       request-controller
```

From the above command, we can see the `grpc` subsystem is installed in this provisioned WildFly server. Now we can see the settings of the `grpc` subsystem by the following command:

```bash
[standalone@localhost:9990 /] ls subsystem=grpc
flow-control-window=undefined                  max-connection-age-grace=undefined             server-port=9555
handshake-timeout=undefined                    max-connection-idle=undefined                  session-cache-size=undefined
initial-flow-control-window=undefined          max-inbound-message-size=undefined             session-timeout=undefined
keep-alive-time=undefined                      max-inbound-metadata-size=undefined            shutdown-timeout=3
keep-alive-timeout=undefined                   permit-keep-alive-time=undefined               ssl-context-name=undefined
key-manager-name=undefined                              permit-keep-alive-without-calls=undefined      start-tls=undefined
max-concurrent-calls-per-connection=undefined  protocol-provider=undefined                    trust-manager-name=undefined
max-connection-age=undefined                   server-host=localhost
```

From the above command output we can see the settings(attributes) of the `grpc` subsystem. We can see the gRPC `server-port` is `9555`. In addition, one of the settings is:

```
key-manager-name=undefined
```

This means the `key-manager` is not set in the `grpc` subsystem, which means it will use `plaintext` to do the gRPC communication by default. After checking the `grpc` subsystem settings, we now need to enable the Servlet context of this sample project together with the `grpc` context. To do so, we need to send a request to the server:

```bash
➤ curl http://localhost:8080/grpcToRest.example.grpc-1.0.1.Final-SNAPSHOT/grpcToJakartaRest/grpcserver/context

2Got org.greet.Greet_Server@4c9c8c0a servletContext⏎
```

After sending the above request, the Servlet context is now enabled. The next step we can call the gRPC bridge API.

>  Note: Currently it needs the Servlet context to be loaded via the above method call, so the gRPC bridge API can call the backend REST service proeperly. This design may change significantly in the future.

To call the gRPC service, we can write a test case like this:

```java
@Test
public void testGreeting() {
    channelPlaintext = ManagedChannelBuilder.forTarget("localhost:9555")
            .usePlaintext()
            .intercept(new ClientLogInterceptor()).
            build();
    blockingStub = GreetServiceGrpc.newBlockingStub(channelPlaintext);

    GeneralEntityMessage.Builder builder = GeneralEntityMessage.newBuilder();
    GeneralEntityMessage gem = builder.setURL("http://localhost:xxx/greet/Bill").build();
    GeneralReturnMessage grm = blockingStub.greet(gem);
    dev_resteasy_example_grpc_greet___Greeting greeting = grm.getDevResteasyExampleGrpcGreetGreetingField();
    Assert.assertEquals("hello, Bill", greeting.getS());

}
```

And the above test case will send the request to the gRPC service port `9555`.

> If you are reading the README file of the sample project, you will see a `GreetingTest` class is provided to sum up the above steps, but it needs some manual steps to setup this test properly into the bridge project. If you feel it’s boring to setup it manually, you can use this already setup project to play with the above test code:
>
> - [grpcToRest.example/src/test/java/org/jboss/resteasy/grpc/server/GreetingTest.java at main · liweinan/grpcToRest.example](https://github.com/liweinan/grpcToRest.example/blob/main/src/test/java/org/jboss/resteasy/grpc/server/GreetingTest.java)

Above is the overall introduction to the currently RESTEasy gRPC feature and the WildFly gRPC subsystem usages. Please note these features are still at its early stages, and the detail implementations of the features may change significantly in the future.

## References

[^resteasy-grpc]: [resteasy/resteasy-grpc: gRPC support for RESTEasy](https://github.com/resteasy/resteasy-grpc)

[^resteasy-examples]: [resteasy/resteasy-examples: RESTEasy examples](https://github.com/resteasy/resteasy-examples)

[^example-readme]: https://github.com/resteasy/resteasy-examples/blob/main/grpc-bridge-example/README.md
[grpc-bridge-example/README.md](https://github.com/resteasy/resteasy-examples/blob/main/grpc-bridge-example/README.md)

[^galleon]: [wildfly/galleon](https://github.com/wildfly/galleon)

