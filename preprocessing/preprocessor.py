import os
from collections import defaultdict
from mapping import get_mapping
from pymongo import MongoClient
import ast
import math
import numpy as np

DATADIR = './data/'
DATAFILE = 'earn_nt_net.tsv'
MAPPING = get_mapping()


def parse_file(datafile):
    data = []
    with open(datafile, 'rU') as f:
        header = f.readline().split(",")
        header[3:] = [col for col in header[3].split("\t")]
        header[3] = 'country' # use a friendly name
        for line in f:
            fields = line.split(",")
            fields[3:] = [col for col in fields[3].split("\t")]
            entry = {} 
            for i, value in enumerate(fields):
                entry[header[i].strip()] = value.strip()
            data.append(entry)
    return data

def classify_per_countries(raw_data):
    countries = defaultdict(list)

    for line in raw_data:
        countries[line['country']].append(line)

    data = [{'country':k, 'stats':v} for k,v in countries.items()]
    return data

def inject_data_mongo(data, collection):
    # DEV
    client = MongoClient('mongodb://localhost:27017')
    # PROD
    #client = MongoClient('mongodb://mic0331:eurostat@ds047672.mongolab.com:47672/eurostat')
    db = client.eurostat
    db[collection].drop()
    db[collection].insert(data)

def is_float(value):
  try:
    float(value)
    return True
  except ValueError:
    return False

def group_years(data, y_from, y_to):
    for line in data:
#        for row in line['stats']:
            stat = []
            for k,v in line.items():
                if k.isdigit():
                    if int(k)>= y_from and int(k) <= y_to:
                        stat.append({
                            "year": int(k),
                            # mark empty value with 0
                            "data": ast.literal_eval(v) if is_float(v) else float('NaN')
                        })
                        stat = sorted(stat, key=lambda k: k['year'])
            for k,v in list(line.items()):
                if k.isdigit():
                    del line[k]
            line['measure'] = stat
    return data

def fillna(data):
    for line in data:
        for k, v in line.items():
            if k is "measure":
                #f =  lambda x, y: x + y if x != math.isnan(x) else 0
                #mean = reduce(f, [d['data'] for d in v]) / len(v)
                #mean = float(sum(d['data'] for d in v)) / len(v)
                d = [float(d['data']) for d in v]
                mean = 0
                if np.count_nonzero(np.isnan(d)) != len(d):
                    mean = np.nanmean(d)
                
                for measure in v:
                    if math.isnan(measure['data']): 
                        measure['data'] = mean                                         
    return data

def get_desc_for(code, value):
    description = ""
    try:
        k_match = next(k for k in MAPPING if k['feature'] == code)
        description = next(k for k in k_match['codes'] if k['code'] == value )
        description = description['label']
    except:
        print("Didn't find ", code, value)    
    return description

def merge_data_label(data):
    for line in data:
#        for row in line['stats']:
            for k, v in line.items():
                if k is not "measure":
                    line[k] = {
                        "code": v,
                        "description": get_desc_for(k, v)
                    }
    return data            

if __name__ == "__main__":
    data = []
    datafile = os.path.join(DATADIR, DATAFILE)
    num_lines = sum(1 for line in open(datafile))
    print("Number of lines in the file : {0}".format(num_lines))
    # stage 1 :: parse the file
    data = parse_file(datafile)
    # (optional) stage 2 :: classify the raw data by country
#    data = classify_per_countries(data)
    # stage 3 :: put all the yearly data in it's own sub-feature
    data = group_years(data, y_from=2000, y_to=2014)
    # stage 4 :: label the feature
    data = merge_data_label(data)
    # stage 4 :: replace NaN by the mean
    data = fillna(data)
    # load the data per country
    inject_data_mongo(data, 'eurn_nt_nets')
    # load the mapping table
    inject_data_mongo(get_mapping(), 'mappings')


