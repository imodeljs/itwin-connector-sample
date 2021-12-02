# DEPRECATED: iTwin Connector

This COBie Connector sample is deprecated.  Please refer to the new connector sample located at: https://github.com/iTwin/connector-samples

Please refer to the general topic about [How to Write A Connector](./WriteAConnector.md)

Special implementation details specific to the COBie Connector will be included below.

**COBie Connector**
As part of this [repository](https://github.com/imodeljs/imodel-connector-sample), an iTwin connector that synchronizes data from COBie sheets is provided as a sample. More information about the implementation of the sample can be found inside COBie Connector [readme](./cOBie-connector/README.md). 

### Extract

In case of the COBie Connector, the cobie-extractor module present in this repository demonstrates how COBie sheet data can be extracted into a sqlite database.

**Provenance**

For COBie data, this sample connector uses a combination of sheet name and unique row name to map data into the iModel. See [updateElementClass](https://github.com/imodeljs/imodel-connector-sample/src/DataAligner.ts) function in the provided sample. When the identifier is provided to the synchronizer, it is stored inside the ExternalSourceAspect class, in the Identifier property.

**Change-detection**

In case of COBIE sheet data timestamps are not available. So in cases like this the connector will have to use some other means of recording and then comparing the state of the source data from run to run. If conversion is cheap, then the source data can be converted again and the results compared to the previous results, as stored in the iModel. In the COBIE case, a cryptographic hash of the source data is used to represent the source data. The hash is stored inside the external source aspect by the synchronizer.

The change-detection algorithm implemented is

- For each source data item:
  - add source item's Id to the *source_items_seen* set
  - Look in the mappings for the corresponding data in the iModel (element, aspect, model)
  - If found,
    - Detect if the source item's current data has changed. If so,
      - Convert the source item to BIS data.
      - Update the corresponding data in the iModel
  - Else,
    - Convert the source data to BIS data
    - Insert the new data into the iModel
    - Add the source data item's Id to the mappings

Infer deletions:

- For each source data item Id previously converted
  - if item Id is not in *source_items_seen*
    - Find the the corresponding data in the iModel
      - Delete the data in the iModel
      - Remove the the source data item's Id from the mappings

In case of COBie connector, the above algorithm implemented inside the [align method of DataAligner](https://github.com/imodeljs/itwin-connector-sample/src/DataAligner.ts)
