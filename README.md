# iTwin Connector

## What is an iTwin?

An iTwin is an infrastructure digital twin.

An iTwin incorporates different types of data repositories – including drawings, specifications, documents, analytical models, photos, reality meshes, IoT feeds, and enterprise resource and enterprise asset management data – into a living digital twin.  Please Go [here](http://www.bentley.com/itwin) to get additional information about iTwins and Bentley iTwin Services

## What is an iModel?
Overview
* Contains digital components assembled from many sources
* Based on open source SQLite relational database format
* Backbone for iTwins

Details

* An iModel is a specialized information container for exchanging data associated with the lifecycle of infrastructure assets. 
* iModels are self-describing, geometrically precise, open, portable, and secure. 
* iModels were created to facilitate the sharing and distribution of information regardless of the source and format of the information. 
* iModels are an essential part of the digital twin world. But a digital twin means a lot more than just an iModel.

## iTwin Connectors

iTwin connectors play an important role in enabling a wide range of both Bentley and third-party design applications to contribute to an iTwin.

Bentley iTwin Services provides connectors to support a wide array of design applications to ensure all of the engineering data can be aggregated into a single digital twin environment inside an iModel.

A complete list of available connectors can be found in [iTwin Services Community Wiki](https://communities.bentley.com/products/digital-twin-cloud-services/itwin-services/w/synchronization-wiki/47595/supported-applications-and-file-formats)

Examples of iTwin Connector include:

![](https://communities.bentley.com/resized-image/__size/650x450/__key/communityserver-wikis-components-files/00-00-00-05-55/Bentley.png)
![](https://communities.bentley.com/resized-image/__size/650x450/__key/communityserver-wikis-components-files/00-00-00-05-55/3rdParty.PNG)

See [Section on iTwin Synchronization](#ways-to-sync-data-to-an-itwin) for more details on existing connectors.

However in certain cases, where a specific format is not covered, one can develop a new connector using  [iModel.js SDK](https://www.itwinjs.org/)

![](./imodel_connector_backend.png)

The imodel-bridge package provided as part of the iModel.js SDK makes it easier to write an iTwin connector backend that brings custom data into a digital twin. To run this environment with the iModel.js library that this package depends on requires JavaScript engine with es2017 support.

Note: Please keep in mind iModelBridge is sometimes used as a synonym for iTwin Connector since it bridges the gap between input data and a digital twin.

**COBie Connector**

"How to write an iTwin Connector" gives a high level overview of the various parts that go into creating an iTwin Connector.

Exceptions to the overview above which were made for the COBie connector are organized similarly below: Extract, Align, 

As part of this [repository](https://github.com/imodeljs/imodel-connector-sample), an iTwin connector that synchronizes data from COBie sheets is provided as a sample. More information about the implementation of the sample can be found inside COBie-connector [readme](./cOBie-connector/README.md). 

### Extract
The cobie-extractor module present in this repository demonstrates how COBie sheet data can be extracted into a sqlite database.

### Align
This sample connector uses a combination of sheet name and unique row name to map data into the iModel. See [updateElementClass](https://github.com/imodeljs/imodel-connector-sample/src/DataAligner.ts) function in the provided sample. When the identifier is provided to the synchronizer, it is stored inside the ExternalSourceAspect class, in the Identifier property.

**Provenance**
Timestamps are not available in the COBIE sheet data. So,  the connector will have to use some other means of recording and then comparing the state of the source data from run to run. If conversion is cheap, then the source data can be converted again and the results compared to the previous results, as stored in the iModel. A cryptographic hash of the source data is used to represent it. The hash is stored inside the external source aspect by the synchronizer.

**Change-detection**
The change-detection algorithm is implemented inside the [align method of DataAligner](https://github.com/imodeljs/itwin-connector-sample/src/DataAligner.ts)

