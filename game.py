# -*- coding: utf-8 -*-

import json
from datetime import datetime

from models import UserRecord

#  USER_RANK = {}  {"joey": {"score": 10, "time": 1000, "try_time": 1}}
NEG_GRAPH = [[153,298,210,364],
[202,575,277,654],
[328,173,359,220],
[422,153,461,203],
[480,95,510,128],
[406,318,450,400],
[393,426,434,479],
[623,123,670,153],
[625,156,666,190],
[688,150,727,200],
[580,423,626,503],
[806,124,845,238],
[863,159,894,221],
[908,172,941,242],
[943,156,974,204],
[895,335,939,447],
[779,471,819,542],
[747,574,804,676]
]

POS_GRAPH = [[77,139,156,193],
[48,331,120,384],
[200,225,300,307],
[195,338,284,390],
[277,396,351,461],
[459,273,578,308],
[466,139,565,227],
[570,140,616,170],
[647,272,698,310],
[595,347,633,370],
[292,97,373,171]
]


class Target:
    def __init__(self, x1, y1, x2, y2):
        self.base_x = x1
        self.base_y = y1
        self.limit_x = x2
        self.limit_y = y2

    def check(self, x, y):
        return self.base_x < x < self.limit_x \
               and self.base_y < y < self.limit_y


class Record:
    def __init__(self):
        self.points1 = [[]]*10
        self.points2 = [[]]*10
        for i in POS_GRAPH:
            self.add(i, self.points1)
        for j in NEG_GRAPH:
            self.add(j, self.points2)

    # 添加新纪录
    def add(self, coor, points):
        tmp = Target(coor[0], coor[1], coor[2], coor[3])
        points[int(coor[0] / 100)].append(tmp)
        if int(coor[2]/100) - int(coor[0]/100):
            points[int(coor[2] / 100)].append(tmp)

    def check(self, point):
        point = json.loads(point)
        if point["cardno"] == 1:
            table = self.points1[int(point["x"]/100)]
        elif point["cardno"] == 2:
            table = self.points2[int(point["x"]/100)]
        for tar in table:
            if tar.check(point["x"], point["y"]):
                return tar.base_x
        return False

    def game_check(self, name, time, points):
        # 判断
        out = set()
        right = []
        wrong = []
        for idx, point in enumerate(points):
            res = self.check(point)
            if res:
                right.append(idx)
                out.add(res)
            else:
                wrong.append(idx)
            if idx > 50:
                break
        score = len(out)
        print score
        # 加入记录
        try:
            p = UserRecord.objects.get(name=name)
            if score > p.score:
                p.score = score
                p.time = time
                p.try_time += 1
                p.last_time = datetime.now()
            else:
                p.try_time += 1
            p.save()
        except UserRecord.DoesNotExist:
            cur_time = datetime.now()
            obj = UserRecord(name=name, time=time, try_time=1, score=score, last_time=cur_time)
            obj.save()
        except Exception,e:
            print e

        # if USER_RANK.get(name):
        #     if score > USER_RANK[name]["score"]:
        #         USER_RANK[name]["score"] = score
        #         USER_RANK[name]["time"] = time
        #         USER_RANK[name]["try_time"] += 1
        #         UserRecord(name=name, time=time, try_time=1, score=score).save()
        #     else:
        #         USER_RANK[name]["try_time"] += 1
        # else:
        #     USER_RANK[name] = {"score": score, "time": time, "try_time": 1}
        return {
            "score": score,
            "right": right,
            "wrong": wrong
        }


def game_rank():
    data = []
    database = UserRecord.objects.all()
    tmp2 = sorted(database, key=lambda x: x.score*300000 + 300000 - x.time, reverse=True)
    # tmp = sorted(USER_RANK, key=lambda x: USER_RANK[x]["score"]*300000 + 300000 - USER_RANK[x]["time"], reverse=True)
    idx = 1
    for player in tmp2:
        data.append([player.name, player.score])
        idx += 1
        if idx > 10:
            break
    return data


def game_rank1():
    objs = UserRecord.objects.order_by("-score", "last_time")[:10]

    return [[obj.name, obj.score] for obj in objs]


Checker = Record()


