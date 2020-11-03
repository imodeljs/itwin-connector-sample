import sys
import re
import xlrd
import sqlite3

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, Column, String, Integer, Table, MetaData

def clean_value(value):
    return str(value).split(':')[1].strip('\'')

def create_db_base():
    wb = xlrd.open_workbook(INPUT_PATH)
    sheets = wb.sheets()
    db_base = {"schema": {}, "objects": {}}
    exclude = {"Instruction", "PickLists"}
    for sheet in sheets:
        if sheet.name in exclude:
            continue

        header_row = sheet.row(0)
        db_base["schema"][sheet.name] = []
        for header in header_row:
            db_base["schema"][sheet.name].append(clean_value(header))

        db_base["objects"][sheet.name] = create_objects(sheet)

    return db_base


def create_objects(sheet):
    header_row = sheet.row(0)
    objects = []

    for nrow in range(1, sheet.nrows):
        row = sheet.row(nrow)
        obj = {}
        for cell, header in zip(row, header_row):
            key = clean_value(header)
            value = clean_value(cell)
            obj[key] = str(value)
        objects.append(obj)

    return objects

def dump_schema(schema):
    for table_name, col_names in schema.items():
        cols = [Column("id", Integer, primary_key=True)]
        cols.extend([Column(name.lower(), String) for name in col_names])
        table = Table(table_name, metadata)
        for col in cols:
            table.append_column(col)

    metadata.create_all(engine)

def dump_objects(objects):
    try:
        conn = engine.connect()
        for (table_name, table) in metadata.tables.items():
            rows = objects[table_name]
            for row in rows:
                colstring = ", ".join(row.keys())
                valarr = [val.replace('"', '""') for val in row.values()]
                valstring = ", ".join([f'\"{val}\"' for val in valarr])
                stmt = f'insert into {table_name} ({colstring}) values ({valstring})'
                conn.execute(stmt)
    except err:
        print(err)

if __name__ == '__main__':
    
    INPUT_PATH = sys.argv[1]
    OUTPUT_PATH = sys.argv[2]

    engine = create_engine(f'sqlite:///{OUTPUT_PATH}')
    metadata = MetaData()
    metadata.reflect(engine)
    Session = sessionmaker(bind=engine)

    db_base = create_db_base()
    dump_schema(db_base["schema"])
    dump_objects(db_base["objects"])


