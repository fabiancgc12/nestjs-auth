<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


## Description

A [Nestjs](https://github.com/nestjs/nest) template with user and auth module out of the box for future projects

Currently handles user CRUD, with filter to look for other users. It handles login and logout using JWT. 
Login is protected with a local guard and theres is also a JWTGuard to protect other api endpoints

It uses TypeOrm and PostgreSql to handle the database area.

The User and Auth modules have integrity tests to verify that everything is working as it should.

To custom the enviroment variables they need to be put in the file src/common/envs as test.env, development.env and production.env, each acording to how it will be used. An empty .env file is being uploaded as a template to describe what are the variables to be used.
