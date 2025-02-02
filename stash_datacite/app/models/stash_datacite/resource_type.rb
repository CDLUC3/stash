# frozen_string_literal: true

module StashDatacite
  class ResourceType < ActiveRecord::Base
    self.table_name = 'dcs_resource_types'
    belongs_to :resource, class_name: StashEngine::Resource.to_s
    include StashEngine::Concerns::ResourceUpdated

    ResourceTypesGeneral = Datacite::Mapping::ResourceTypeGeneral.map(&:value)

    ResourceTypeGeneralEnum = ResourceTypesGeneral.map { |i| [i.downcase.to_sym, i.downcase] }.to_h
    ResourceTypesGeneralStrToFull = ResourceTypesGeneral.map { |i| [i.downcase, i] }.to_h

    # odd ones out here are Spreadsheet, Video, Multiple Types and are only for UI display

    ResourceTypesGeneralLimited = { Spreadsheet: 'dataset', Image: 'image', Sound: 'sound', Video: 'audiovisual',
                                    Text: 'text', Software: 'software', "Multiple Types": 'collection', Other: 'other' }.freeze

    enum resource_type_general: ResourceTypeGeneralEnum

    def resource_type_general_friendly
      return nil if resource_type_general.blank?

      ResourceTypesGeneralStrToFull[resource_type_general]
    end

    def resource_type_general_ui
      return nil if resource_type_general.blank?

      ResourceTypesGeneralLimited.invert[resource_type_general].to_s
    end

    def self.resource_type_general_mapping_obj(str)
      return nil if str.nil?

      Datacite::Mapping::ResourceTypeGeneral.find_by_value(str)
    end

    def resource_type_general_mapping_obj
      return nil if resource_type_general_friendly.nil?

      ResourceType.resource_type_general_mapping_obj(resource_type_general_friendly)
    end
  end
end
