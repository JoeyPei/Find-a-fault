# -*- coding: utf-8 -*-

from django.contrib import admin
from models import *


# Register your models here.
class UserRecordAdmin(admin.ModelAdmin):
    list_display = ('name', 'time', 'last_time', 'try_time', 'score',)
    search_fields = ('name', 'score',)
    list_filter = ('score',)
admin.site.register(UserRecord, UserRecordAdmin)

# Register your models here.
