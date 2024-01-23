---
layout: post
title: "resteasy-grpc: Handling arrays"
subtitle: ""
date: 2024-01-23
author: Ron Sigal
---

Release 1.0.0.Alpha5 of resteasy-grpc has a new feature for handling arbitrary arrays. Although protobuf comes
with a representation of one dimension arrays, e.g.

```
    message ints {
      repeated int64 is = 1;
    }
```

represents an array `int[]`, there is no built-in way of handling multidimensional arrays like `int[][]`, so we
have to do it explicitly.

The mechanism has two parts:

1. arrays.proto, which defines `dev_resteasy_grpc_arrays___ArrayHolder`, and
2. `dev.resteasy.grpc.arrays.ArrayUtility` in grpc-bridge-runtime.

arrays.proto looks like this:

```
        message dev_resteasy_grpc_arrays___BooleanArray {
           repeated bool bool_field = 1;
        }

        message dev_resteasy_grpc_arrays___ByteArray {
           bytes bytes_field = 1;
        }

        ...

        message dev_resteasy_grpc_arrays___AnyArray {
           repeated google.protobuf.Any any_field = 1;
        }

        message dev_resteasy_grpc_arrays___ArrayHolderArray {
           repeated dev_resteasy_grpc_arrays___ArrayHolder arrayHolder_field = 1;
        }

        message dev_resteasy_grpc_arrays___ArrayHolder {
           string componentClass = 1;
           oneof messageType {
              dev_resteasy_grpc_arrays___BooleanArray booleanArray_field = 3;
              dev_resteasy_grpc_arrays___ByteArray byteArray_field = 4;
              ...
              dev_resteasy_grpc_arrays___AnyArray anyArray_field = 12;
              dev_resteasy_grpc_arrays___ArrayHolderArray arrayHolderArray_field = 13;
           }
        }

```

It starts with a definition of array message types for

1. all primitive types,
2. `google.protobuf.Any`, and
3. `dev_resteasy_grpc_arrays___ArrayHolder` itself.

Then, `dev_resteasy_grpc_arrays___ArrayHolder` is defined with a oneof field that can
hold any of these array message types. The self-referential field

```
              dev_resteasy_grpc_arrays___ArrayHolderArray arrayHolderArray_field = 13;
```

is what allows a `dev_resteasy_grpc_arrays___ArrayHolder` to represent arrays with any number of
dimension.

Compiling arrays.proto generates `dev.resteasy.grpc.arrays.Array_proto`, which gives us a
gateway into the javabuf[^javabuf] world. Suppose we want to generate a representation of
`int[] {3, 5}`. That would look like

```
        dev_resteasy_grpc_arrays___IntArray.Builder iab = dev_resteasy_grpc_arrays___IntArray.newBuilder();
        iab.addIntField(3);
        iab.addIntField(5);
        dev_resteasy_grpc_arrays___IntArray ia = iab.build();
        dev_resteasy_grpc_arrays___ArrayHolder.Builder ahb = dev_resteasy_grpc_arrays___ArrayHolder.newBuilder();
        ahb.setIntArrayField(ia);
        ahb.setComponentClass(int.class.getName());
        dev_resteasy_grpc_arrays___ArrayHolder ah = ahb.build();
        System.out.println(ah);
```

The output would be

```
        componentClass: "int"
        intArray_field {
           int_field: 1
           int_field: 2
        }
```

{% raw %}
A similar, but rather longer, sequence would be required to build a javabuf representation
of `int[][] {{3, 5}, {7, 11, 13}}`.
To avoid the mess, grpc-bridge-runtime includes the class `dev.resteasy.grpc.arrays.ArrayUtility`. With `ArrayUtility`,
building the javabuf representation of `int[][] {{3, 5}, {7, 11, 13}}` is as easy as

```
        dev_resteasy_grpc_arrays___ArrayHolder holder = ArrayUtility.getHolder(new int[][] {{3, 5}, {7, 11, 13}});
```

Moreover, `ArrayUtility` can turn the `dev_resteasy_grpc_arrays___ArrayHolder` back to the original array:

```
        Object array = ArrayUtility.getArray(holder);
        Assert.assertArrayEquals(new int[][] {{3, 5}, {7, 11, 13}}, (int[][]) array);
```

These two calls to `ArrayUtility` depend on the fact that the target array is built from a primitive Java type. If the
array uses an application specific type, then there are two alternative calls that can be used:

```
        public static dev_resteasy_grpc_arrays___ArrayHolder getHolder(JavabufTranslator translator, Object o);
```   

and

```
        public static Object getArray(JavabufTranslator translator, Array_proto.dev_resteasy_grpc_arrays___ArrayHolder ah) throws Exception;
```

Also, if an application uses arrays, the generated `JavabufTranslator` incorporates `ArrayUtility`, so that it can be
used instead:

```
        dev_resteasy_grpc_arrays___ArrayHolder ah = (dev_resteasy_grpc_arrays___ArrayHolder) translator.translateToJavabuf(new int[][] {{3, 5}, {7, 11, 13}});
        Object array = translator.translateFromJavabuf(ah);
        Assert.assertArrayEquals(new int[][] {{3, 5}, {7, 11, 13}}, (int[][]) array);
```   
{% endraw %}

**Note.** The latter point can be usefully expanded, independent of the presence of arrays. Consider the class

```
        package dev.resteasy.grpc.example;

        public class C {
            private int i;
            private double d;
            private String s;

            public C(int i, double d, String s) {
                this.i = i;
                this.d = d;
                this.s = s;
            }
        }
```

Using the fluent methods created in, say, `C_proto` by the protobuf parser, an instance of
`C_proto.dev_resteasy_grpc_example___C` can be created by

```
        C_proto.dev_resteasy_grpc_example___C.Builder cb = C_proto.dev_resteasy_grpc_example___C.newBuilder();
        C_proto.dev_resteasy_grpc_example___C c1 = cb.setI(3).setD(5.0).setS("seven").build();
```

Note that each field must be set individually. On the other hand, given the `C(int, double, String)` constructor,
an instance of `C_proto.dev_resteasy_grpc_example___C` can be created more directly:

```
        C_proto.dev_resteasy_grpc_example___C c2 = (C_proto.dev_resteasy_grpc_example___C) translator.translateToJavabuf(new C(3, 5.0, "seven"));
```

They accomplish the same thing, so the choice is a matter of taste.

## Notes

[^javabuf]: See the documentation
at [https://github.com/resteasy/resteasy-grpc/blob/main/docs/grpc-bridge.md](https://github.com/resteasy/resteasy-grpc/blob/main/docs/grpc-bridge.md)
for a discussion of javabuf classes
