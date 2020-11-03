/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Subject, DefinitionPartition, DefinitionModel, PhysicalPartition, PhysicalModel, SpatialLocationPartition, SpatialLocationModel, SpatialCategory,
  InformationRecordPartition, InformationRecordModel, DocumentPartition, DocumentListModel, GroupInformationPartition, GroupModel } from "@bentley/imodeljs-backend";
import * as COBieElements from "./COBieElements";
import * as COBieRelationships from "./COBieRelationships";
import * as COBieRelatedElements from "./COBieRelatedElements";

/*

ElementTree Syntax:

subjects: { <subject_name>: { partitions ... }, ... }
partitions: { <partition_name>: { models ... }, ... }
models: { <model_name>: { elements | elementClasses ... }, ... }
elements: { <element_name>: { element specifications ... }, ... } (# of elements created = Object.keys(elements).length)
elementClasses: { <element_class_name>: { element specifications ... }, ... } (# of elements created = # of rows in a database table)
relationshipClasses: { <relationship_class_name>: { relationship specifications ... }, ... } (# of elements created = # of rows in a database table)

elementClasses | elements: {
  <element_class_name> | <element_name>: {
    ref: reference to the element's corresponding TypeScript class
    (categoryName): globally unique name for a category. It is used to get the category
    typeDefinition: {
      ref: reference to the TypeDefinition Element's TS class
      modelName: the name of the model that contains the TypeDefinition element
      key: the foreign key of a table in the intermediary SQLite database. It is used to get the BIS codeValue of the related Element.
    }
  }
}

relationshipClasses: {
  <relationship_class_name>: {
    ref: reference to the relationship's corresponding TypeScript class
    sourceRef: reference to the source element's corresponding TypeScript class
    sourceModelName: the name of the model that contains the source element
    sourceKey: the foreign key value used to find source element
    targetRef: reference to the target element's corresponding TypeScript class
    targetModelName: the name of the model that contains the target element
    targetKey: the foreign key value used to find target element
  }
}

*/

export const SAMPLE_ELEMENT_TREE: any = {
  subjects: {
    Subject1: {
      ref: Subject,
      partitions: {
        DefinitionPartition1: {
          ref: DefinitionPartition,
          models: {
            DefinitionModel1: {
              ref: DefinitionModel,
              elements: {
                SpatialCategory1: {
                  ref: SpatialCategory,
                },
              },
              elementClasses: {
                Type: {
                  ref: COBieElements.Type,
                },
              },
            },
          },
        },
        PhysicalPartition1: {
          ref: PhysicalPartition,
          models: {
            PhysicalModel1: {
              ref: PhysicalModel,
              elementClasses: {
                Component: {
                  ref: COBieElements.Component,
                  categoryName: "SpatialCategory1",
                  typeDefinition: {
                    ref: COBieElements.Type,
                    modelName: "DefinitionModel1",
                    key: "Component.typename",
                  },
                },
              },
              relationshipClasses: {
                ComponentConnectsToComponent: {
                  ref: COBieRelationships.ComponentConnectsToComponent,
                  sourceRef: COBieElements.Component,
                  sourceModelName: "PhysicalModel1",
                  sourceKey: "Connection.rowname1",
                  targetRef: COBieElements.Component,
                  targetModelName: "PhysicalModel1",
                  targetKey: "Connection.rowname2",
                },
                ComponentAssemblesComponents: {
                  ref: COBieRelatedElements.ComponentAssemblesComponents,
                  sourceRef: COBieElements.Component,
                  sourceModelName: "PhysicalModel1",
                  sourceKey: "Assembly.parentname",
                  targetRef: COBieElements.Component,
                  targetModelName: "PhysicalModel1",
                  targetKey: "Assembly.childnames",
                },
              },
            },
          },
        },
        SpatialLocationPartition1: {
          ref: SpatialLocationPartition,
          models: {
            SpatialLocationModel1: {
              ref: SpatialLocationModel,
              elementClasses: {
                Facility: {
                  ref: COBieElements.Facility,
                  categoryName: "SpatialCategory1",
                },
                Floor: {
                  ref: COBieElements.Floor,
                  categoryName: "SpatialCategory1",
                },
                Space: {
                  ref: COBieElements.Space,
                  categoryName: "SpatialCategory1",
                },
              },
              relationshipClasses: {
                FloorComposesSpaces: {
                  ref: COBieRelatedElements.FloorComposesSpaces,
                  sourceRef: COBieElements.Floor,
                  sourceModelName: "SpatialLocationModel1",
                  sourceKey: "Space.floorname",
                  targetRef: COBieElements.Space,
                  targetModelName: "SpatialLocationModel1",
                  targetKey: "Space.name",
                },
              },
            },
          },
        },
        InformationRecordPartition1: {
          ref: InformationRecordPartition,
          models: {
            InformationRecordModel1: {
              ref: InformationRecordModel,
              elementClasses: {
                Assembly: {
                  ref: COBieElements.Assembly,
                },
                Attribute: {
                  ref: COBieElements.Attribute,
                },
                Contact: {
                  ref: COBieElements.Contact,
                },
                Connection: {
                  ref: COBieElements.Connection,
                },
                Resource: {
                  ref: COBieElements.Resource,
                },
                Spare: {
                  ref: COBieElements.Spare,
                },
                Job: {
                  ref: COBieElements.Job,
                },
                Issue: {
                  ref: COBieElements.Issue,
                },
                Impact: {
                  ref: COBieElements.Impact,
                },
              },
            },
          },
        },
        GroupInformationPartition1: {
          ref: GroupInformationPartition,
          models: {
            GroupInformationModel1: {
              ref: GroupModel,
              elementClasses: {
                Zone: {
                  ref: COBieElements.Zone,
                },
                System: {
                  ref: COBieElements.System,
                },
              },
              relationshipClasses: {
                ZoneIncludesSpaces: {
                  ref: COBieRelationships.ZoneIncludesSpaces,
                  sourceRef: COBieElements.Zone,
                  sourceModelName: "GroupInformationModel1",
                  sourceKey: "Zone.id",
                  targetRef: COBieElements.Space,
                  targetModelName: "SpatialLocationModel1",
                  targetKey: "Zone.spacenames",
                },
                SystemGroupsComponents: {
                  ref: COBieRelationships.SystemGroupsComponents,
                  sourceRef: COBieElements.System,
                  sourceModelName: "GroupInformationModel1",
                  sourceKey: "System.id",
                  targetRef: COBieElements.Component,
                  targetModelName: "PhysicalModel1",
                  targetKey: "System.componentnames",
                },
              },
            },
          },
        },
        DocumentPartition1: {
          ref: DocumentPartition,
          models: {
            DocumentListModel1: {
              ref: DocumentListModel,
              elementClasses: {
                Document: {
                  ref: COBieElements.Document,
                },
              },
            },
          },
        },
      },
    },
  },
};
