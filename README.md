<h2 align='center'> Simple Auth </h2>

## About The Project

Simple Auth is framework-agnostic* authentication library for Typescript.
Providing a comprehensive set of default providers you can choose to use, with
the ability to add your own custom ones!

## Why Make Simple Auth

There are plenty of great auth libraries, packages or even third party solutions
out there, but i found it annoying having to deal with many different adapters,
different types of request and more. So i built simple auth, it uses basic https
request, responses and cookies to control the auth flow

## Dependencies

The goal when writing Simple Auth is to use the least amount of dependencies as
possible, that way it stays small and wont break if a dependency doesn't get
updated, or if an update causes breaking changes. What Simple Auth now depends
on is:

- [Arctic JS](https://github.com/pilcrowonpaper/arctic) for OAuth Clients

## Contribution

Simple Auth is free and open source project. You are free to do whatever you
want with it. You could help continuing its development by:

- Contribute to the source code
- Contribute to the docs

## Warnings*

- Simple Auth should be framework-agnostic, because it uses basic http request,
  response and cookies, and uses basic typescript. But these claims have not
  been tested.
