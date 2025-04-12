# ptu-pdf-to-database

A data migration tool for reading data for [the Pokemon Tabletop United (PTU) TTRPG system](https://pokemontabletop.com/about) from PDF to JSON to MongoDB.

## Why was this tool made?
I have [a Discord Bot](https://github.com/beanc16/roll-of-darkness-bot) that allows users to look up data for PTU, but it was missing data from Pokemon's 9th Generation. This tool parses the data from the Unofficial Gen 9 Homebrew document into the JSON structure that the bot expects, then insert it into the database that the bot uses.

## Environment Variables
Create a `.env` file with the following environment variables in order to run the file.
```sh
# MongoDB
MONGO_DB_NAME=""        # The name of your mongo database
MONGO_URI=""            # The URI of your mongo cluster
COLLECTION_POKEMON=""   # The name of your mongo collection to insert data into in your mongo database

# OpenAI
OPENAI_API_KEY=""       # Your API key provided by OpenAI

# Options
DATA_TO_PARSE=""        # String Enum Options: "PTU_GEN_9"

# Batching Options
START_AT_PAGE_INDEX=0   # The PDF page index to start parsing data at
# END_AT_PAGE_INDEX=3   # The PDF page index to stop parsing data at (defaults to the whole PDF if excluded)

# Orchestration Options (toggle to control what the program does/doesn't run)
SHOW_PROCESSING_LOGS='true' # Boolean for processing-related progress
SKIP_PROCESSING='false'     # Boolean for processing the PDF into JSON
SAVE_TO_JSON_FILE='true'    # Boolean for saving the processed JSON to local files (necessary in order to save to the database - also works as a final manual human check to ensure all data is correct before saving to the database)
SAVE_TO_DATABASE='true'     # Boolean for saving to the database
```

## Known Issues
This data parser gets around 93-98% of the data correct, though some issues had to be corrected by-hand. Sometimes:
- Special Defense or Speed would be set as the first number of the base stat total instead of the number for their respective stat. This is likely because the base stat total is occasionally read as being on the same or a different line from special defense or speed, which confused the PDF reader.
- Move or Ability names with more than one word in them didn't have a space between each words.
- The imperial weight (lbs) was duplicated to the PTU weight class value.
- The Mountable Capability did not include the number after it to specify how many riders can mount the Pokemon at once.
