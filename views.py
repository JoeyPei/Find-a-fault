# -*- coding: utf-8 -*-

import os
import time

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, Http404
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
import game
import logging
logger = logging.getLogger("django")


def activity_home(request):
    return render(request, 'game.html')


def activity_get_rank(request):
    data = game.game_rank1()
    logger.info(data)
    return JsonResponse({"data":data})

@csrf_exempt
def activity_get_score(request):
    if request.method == 'POST':
        name = request.POST.get('player_name')
        points = request.POST.getlist('point[]')
        record = int(time.time() - 1491547484) % 300000 # 待修复
        res = game.Checker.game_check(name, record, points)
        return JsonResponse(res)
    else:
        raise Http404



