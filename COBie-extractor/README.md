# COBie Extractor

A Python script that dumps COBie Excel data into an intermediary SQLite database consumed by COBie-connector.

## Instructions

1. run "pip install -r requirements.txt" to install dependencies
2. run "make all" to create all intermediary databases
3. Linux / WSL: run "sh transferdb.sh" to move the newly created to COBie-connector folder as the input for COBie connector. Other OS: manually move the intermediary databases to COBie-connector/test/assets/.

## Allowed Schema Changes

1. Add New Column
2. Add New Table
