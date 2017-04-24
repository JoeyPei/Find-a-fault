# -*- coding: utf-8 -*-

from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.activity_home, name='activity'),
    url(r'^rank/$', views.activity_get_rank, name='activity_get_rank'),
    url(r'^score/$', views.activity_get_score, name='activity_get_score')
]
