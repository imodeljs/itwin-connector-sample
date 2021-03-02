/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { EntityClassProps, RelationshipClassProps, PrimitiveType } from "@bentley/ecschema-metadata";

export const PropertyTypeMap: {[propertyName: string]: any} = {
  elevation: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  height: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  usableheight: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  grossarea: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  netarea: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  nominallength: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  nominalwidth: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  nominalheight: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  duration: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  coordinatexaxis: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  coordinateyaxis: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  coordinatezaxis: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  clockwiserotation: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  elevationalrotation: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
  yawrotation: {
    typeName: "double",
    typeValue: PrimitiveType.Double,
  },
};

function reverseMap(map: {[key: string]: string}) {
  const reverse: {[ecPropertyName: string]: string} = {};
  const keys = Object.keys(map);
  for (const key of keys) {
    reverse[PropertyRenameMap[key]] = key;
  }
  return reverse;
}

export const PropertyRenameMap: {[propertyName: string]: string} = { id: "rowid", category: "cobiecategory", name: "cobiename" };
export const PropertyRenameReverseMap = reverseMap(PropertyRenameMap);

export const COBieBaseEntityProps: EntityClassProps[] = [];
export const COBieEntityPropMap: { [className: string]: EntityClassProps } = {
  Assembly: {
    name: "Assembly",
    baseClass: "BisCore:InformationRecordElement",
  },
  Attribute: {
    name: "Attribute",
    baseClass: "BisCore:InformationRecordElement",
  },
  Component: {
    name: "Component",
    baseClass: "BisCore:PhysicalElement",
  },
  Connection: {
    name: "Connection",
    baseClass: "BisCore:InformationRecordElement",
  },
  Contact: {
    name: "Contact",
    baseClass: "BisCore:InformationRecordElement",
  },
  Document: {
    name: "Document",
    baseClass: "BisCore:Document",
  },
  Facility: {
    name: "Facility",
    baseClass: "BuildingSpatial:Building",
  },
  Floor: {
    name: "Floor",
    baseClass: "BuildingSpatial:RegularStory",
  },
  Impact: {
    name: "Impact",
    baseClass: "BisCore:InformationRecordElement",
  },
  Issue: {
    name: "Issue",
    baseClass: "BisCore:InformationRecordElement",
  },
  Spare: {
    name: "Spare",
    baseClass: "BisCore:InformationRecordElement",
  },
  Job: {
    name: "Job",
    baseClass: "BisCore:InformationRecordElement",
  },
  Resource: {
    name: "Resource",
    baseClass: "BisCore:InformationRecordElement",
  },
  Space: {
    name: "Space",
    baseClass: "BuildingSpatial:Space",
  },
  System: {
    name: "System",
    baseClass: "BisCore:GroupInformationElement",
  },
  Type: {
    name: "Type",
    baseClass: "BisCore:PhysicalType",
  },
  Zone: {
    name: "Zone",
    baseClass: "BisCore:GroupInformationElement",
    // NOT AVAILABLE YET: baseClass: "SpatialComposition:SpatialLocationGroup",
  },
};

export const COBieRelationshipProps: RelationshipClassProps[] = [
  {
    name: "ComponentConnectsToComponent",
    baseClass: "BisCore:ElementRefersToElements",
    strength: "Referencing",
    strengthDirection: "Forward",
    source: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "From Component",
      abstractConstraint: "BisCore.PhysicalElement",
      constraintClasses: ["COBieConnectorDynamic.Component"],
    },
    target: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "To Component",
      abstractConstraint: "BisCore.PhysicalElement",
      constraintClasses: ["COBieConnectorDynamic.Component"],
    },
  },
  {
    name: "ComponentAssemblesComponents",
    baseClass: "BisCore:PhysicalElementAssemblesElements",
    strength: "Embedding",
    strengthDirection: "Forward",
    source: {
      polymorphic: true,
      multiplicity: "(0..1)",
      roleLabel: "assmbles",
      abstractConstraint: "BisCore.PhysicalElement",
      constraintClasses: ["COBieConnectorDynamic.Component"],
    },
    target: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "is assembled by",
      abstractConstraint: "BisCore.PhysicalElement",
      constraintClasses: ["COBieConnectorDynamic.Component"],
    },
  },
  {
    name: "SystemGroupsComponents",
    baseClass: "BisCore:ElementGroupsMembers",
    strength: "Referencing",
    strengthDirection: "Forward",
    source: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "System",
      abstractConstraint: "BisCore.GroupInformationElement",
      constraintClasses: ["COBieConnectorDynamic.System"],
    },
    target: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "Physical Component",
      abstractConstraint: "BisCore.PhysicalElement",
      constraintClasses: ["COBieConnectorDynamic.Component"],
    },
  },
  {
    name: "ZoneIncludesSpaces",
    baseClass: "BisCore:ElementGroupsMembers",
    strength: "Referencing",
    strengthDirection: "Forward",
    source: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "Zone",
      abstractConstraint: "BisCore.GroupInformationElement",
      constraintClasses: ["COBieConnectorDynamic.Zone"],
    },
    target: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "Spaces",
      abstractConstraint: "BisCore.SpatialLocationElement",
      constraintClasses: ["COBieConnectorDynamic.Space"],
    },
  },
  {
    name: "FloorComposesSpaces",
    baseClass: "SpatialComposition:CompositeComposesSubComposites",
    strength: "Embedding",
    strengthDirection: "Forward",
    source: {
      polymorphic: true,
      multiplicity: "(0..1)",
      roleLabel: "is composed by",
      abstractConstraint: "SpatialComposition.CompositeElement",
      constraintClasses: ["COBieConnectorDynamic.Floor"],
    },
    target: {
      polymorphic: true,
      multiplicity: "(0..*)",
      roleLabel: "composes",
      abstractConstraint: "SpatialComposition.CompositeElement",
      constraintClasses: ["COBieConnectorDynamic.Space"],
    },
  },
];