#!/usr/bin/env python3
import io
import json
from collections import OrderedDict

NUM_SUGGESTIONS = 5
MAX_COUNT = 100000
IDX_WORD = 1
IDX_CAP = -1
START = '100106029' # 'rank'

def insert_word(wmap, word):
    for n in range(1, len(word)+1):
        key = word[:n].lower()
        if key not in wmap:
            wmap[key] = [word]
        elif len(wmap[key])<NUM_SUGGESTIONS and word not in wmap[key]:
            wmap[key].append(word)

def proc_words(path):
    wmap = OrderedDict()

    with io.open(path, 'rt', errors='replace') as f:
        started = False
        count = 0
        for line in f:
            if not started:
                if line.startswith(START):
                    started = True
            else:
                vs = line.split(' ', 6)
                word = vs[IDX_WORD]
                if (word[0]<'a') or (word[0]>'z') or ('&' in word) or (':' in word):
                    continue
                word = word.replace('_', ' ')
                if IDX_CAP>=0 and float(vs[IDX_CAP]) > 0.7:
                    word = word.title()
                insert_word(wmap, word)
                count += 1
                if count > MAX_COUNT:
                    break

    return {k: wmap[k] for k in sorted(wmap)}

def save_json(obj, path):
    with io.open(path, 'wt') as f:
        json.dump(obj, f, separators=(',', ':'))

def save_js(obj, path):
    data = json.dumps(obj, separators=(',', ':'))
    with io.open(path, 'wt') as f:
        f.write('var wordFreqDB = ')
        f.write(data)
        f.write(';\n')

if __name__ == '__main__':
    save_js(proc_words('source_data/all.num.o5'), 'words.js')
    
    # Word frequency database 'all.num.o5' can be downloaded from
    # https://www.kilgarriff.co.uk/bnc-readme.html
