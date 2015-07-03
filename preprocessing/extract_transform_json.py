import os
import ast
from mapping import get_mapping
import json

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

def is_float(value):
  try:
    float(value)
    return True
  except ValueError:
    return False

def group_years(data, y_from, y_to):
    for line in data:
            stat = []
            for k,v in line.items():
                if k.isdigit():
                    if int(k)>= y_from and int(k) <= y_to:
                        stat.append({
                            "year": int(k),
                            "data": ast.literal_eval(v) if is_float(v) else float('NaN')
                        })
                        stat = sorted(stat, key=lambda k: k['year'])
            for k,v in list(line.items()):
                if k.isdigit():
                    del line[k]
            line['measure'] = stat
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

def clean_data(data):
    out1 = []
    for line in data:
        for k, v in line.items():
            if k == "estruct":
                if v['code'] in ['TAX', 'NET']:
                    out1.append(line)
    out2 = []
    for line in out1:
        for k, v in line.items():
            if k =="ecase":
                if v['code'] == 'A1_100':
                    out2.append(line)
    out3 = []
    for line in out2:
        for k, v in line.items():
            if k =="country":
                if v['code'] not in ['EA17', 'EA18', 'EA19', 'EU15', 'EU25', 'EU27','EU28', 'HR', 'CY', 'JP', 'US']:
                    out3.append(line)
    out4 = []
    for line in out3:
        for k, v in line.items():
            if k =="currency":
                if v['code'] == 'EUR':
                    out4.append(line)
    return out4

if __name__ == "__main__":
    datafile = os.path.join(DATADIR, DATAFILE)
    num_lines = sum(1 for line in open(datafile))
    print("Number of lines in the file : {0}".format(num_lines))
    # stage 1 :: parse the file
    data = parse_file(datafile)
    # stage 3 :: put all the yearly data in it's own sub-feature
    data = group_years(data, y_from=2000, y_to=2013)
    # stage 4 :: label the feature
    data = merge_data_label(data)
    # stage 5 :: remove unecessary information
    data = clean_data(data)
    # write JSON to file
    with open(DATADIR + "out.json", 'w') as outfile:
        json.dump(data, outfile)