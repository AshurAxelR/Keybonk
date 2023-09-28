#!/usr/bin/env python3
import io
import re
import json
from collections import OrderedDict

NUM_SUGGESTIONS = 5
MAX_COUNT = 100000
MAX_KEY = 6
MAX_LENGTH = 8
IDX_WORD = 1
IDX_CAP = -1
START = '100106029' # 'rank'

def includes(words, word, warn=False):
    if not warn:
        return word in words
    else:
        sus = False
        for w in words:
            if word==w:
                return True
            elif w.startswith(word):
                sus = w
        if sus:
            print(f'warning: allowed {word}. Is it {sus}?')
        return False

def load_bads(path):
    bads = set()
    with io.open(path, 'rt') as f:
        for line in f:
            line = line.strip().lower()
            if line:
                bads.add(line)
                bads.add(line + 's')
                bads.add(line + 'y')
    return bads

def proc_words_func(path, bads, max_count, func):
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
                if includes(bads, re.sub(r'[^a-z\-]', '', word.lower()), warn=False):
                    continue
                word = word.replace('_', ' ')
                if IDX_CAP>=0 and float(vs[IDX_CAP]) > 0.7:
                    word = word.title()
                if func(word):
                    count += 1
                    if count > max_count:
                        return

def type_suggestion_dict(path, bads=set()):
    wmap = OrderedDict()

    def insert_word(word):
        m = min(len(word), MAX_KEY) + 1
        for n in range(1, m):
            key = word[:n].lower()
            if ' ' in key:
                break
            if key not in wmap:
                wmap[key] = [word]
            elif len(wmap[key]) < NUM_SUGGESTIONS and word not in wmap[key]:
                wmap[key].append(word)

    proc_words_func(path, bads, MAX_COUNT, insert_word)
    return {k: wmap[k] for k in sorted(wmap)}

def list_words(path, bads=set()):
    words = OrderedDict()

    def add(word):
        word = word[:MAX_LENGTH]
        if ' ' in word:
            return False
        while not word[-1].isalpha():
            word = word[:-1]
        if word and word not in words:
            words[word] = None
            return True
        return False

    proc_words_func(path, bads, MAX_COUNT, add)
    return [k for k in sorted(words)]

def save_json(obj, path):
    with io.open(path, 'wt') as f:
        json.dump(obj, f, separators=(',', ':'))

def save_js(obj, path):
    data = json.dumps(obj, separators=(',', ':'))
    with io.open(path, 'wt') as f:
        f.write('var wordFreqDB = ')
        f.write(data)
        f.write(';\n')

def save_text(obj, path):
    with io.open(path, 'wt') as f:
        for w in obj:
            print(w, file=f)

if __name__ == '__main__':
    # save_json(type_suggestion_dict('source_data/all.num.o5', load_bads('source_data/bad-words2.txt')), 'words.json')
    save_text(list_words('source_data/all.num.o5', load_bads('source_data/bad-words2.txt')), 'all_words.txt')
    
    # Word frequency database 'all.num.o5' can be downloaded from
    # https://www.kilgarriff.co.uk/bnc-readme.html
    
    # Bad words database can be downloaded from
    # https://github.com/coffee-and-fun/google-profanity-words
