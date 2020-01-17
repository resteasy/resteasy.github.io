---
layout:     post
title:      "RESTEasy 3.10.0.Final: Jakarta artifacts, new configuration parameter"
subtitle:   ""
date:       Jan 15, 2020 19:04:00
author:     Ron Sigal
---
Here comes the first **RESTEasy** release of 2020!

RESTEasy [3.10.0.Final](https://issues.redhat.com/secure/ReleaseNote.jspa?version=12342766&styleName=Html&projectId=12310560&Create=Create&atl_token=AQZJ-FV3A-N91S-UDEU_b8c753450b4d294f915fafd56bfd6bc6897c2219_lin),
which will ship with Wildfly 19, is the first release in the 3.x line to support the **Jakarta EE** APIs. For more discussion on that topic, see the blog post
["RESTEasy 4.4.0.Final: moving to Jakarta artifacts and much more"](https://resteasy.github.io/2019/10/30/resteasy-440final-moving-to-jakarta-artifacts-and-much-more/).

Besides a number of bug fixes, it comes with a new configuration parameter, "resteasy.disable.providers", which, together with
the parameters "resteasy.providers" and "resteasy.use.builtin.providers", gives a way of configuring the set of enabled
RESTEasy builtin providers.

The new parameter helped motivate exposing the RESTEasy configuration parameters in the
Wildfly management model. For example, the jaxrs subsystem in standalone.xml can now look like

    <subsystem xmlns="urn:jboss:domain:jaxrs:2.0">
        <resteasy-add-charset>false</resteasy-add-charset>
        <resteasy-jndi-resources>
            <jndi>java:global/jaxrsnoap/EJB_Resource1</jndi>
            <jndi>java:global/jaxrsnoap/EJB_Resource1</jndi>
        </resteasy-jndi-resources>
        <resteasy-media-type-mappings>
            <entry key="en">en-US</entry>
            <entry key="es">es</entry>
        </resteasy-media-type-mappings>
    </subsystem>

These values can be accessed from the Command Line Interface as well:

    [standalone@localhost:9990 /] cd subsystem=jaxrs
    [standalone@localhost:9990 subsystem=jaxrs] :read-resource
    {
        "outcome" => "success",
        "result" => {
            ...
            "resteasy-add-charset" => false,
            ...
            "resteasy-jndi-resources" => [
                "java:global/jaxrsnoap/EJB_Resource1",
                "java:global/jaxrsnoap/EJB_Resource1"
            ],
            ...
            "resteasy-media-type-mappings" => {
                "en" => "en-US",
                "es" => "es"
            },
        }
    }

    [standalone@localhost:9990 subsystem=jaxrs] :write-attribute(name=resteasy-add-charset,value=true)
    {"outcome" => "success"}

    [standalone@localhost:9990 subsystem=jaxrs] :read-resource
    {
        "outcome" => "success",
        "result" => {
            ...
            "resteasy-add-charset" => true,
            ...
            "resteasy-jndi-resources" => [
                "java:global/jaxrsnoap/EJB_Resource1",
                "java:global/jaxrsnoap/EJB_Resource1"
            ],
            ...
            "resteasy-media-type-mappings" => {
                "en" => "en-US",
                "es" => "es"
            },
        }
    }

Stay tuned for Wildfly 19!





                    




                    

                    


                
