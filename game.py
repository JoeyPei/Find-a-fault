

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

        return {
            "score": score,
            "right": right,
            "wrong": wrong
        }


def game_rank():
    data = []
    database = UserRecord.objects.all()
    tmp2 = sorted(database, key=lambda x: x.score*300000 + 300000 - x.time, reverse=True)
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


