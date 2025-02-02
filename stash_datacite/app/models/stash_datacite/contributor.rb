# frozen_string_literal: true

module StashDatacite
  class Contributor < ActiveRecord::Base
    self.table_name = 'dcs_contributors'
    belongs_to :resource, class_name: StashEngine::Resource.to_s
    belongs_to :name_identifier
    has_and_belongs_to_many :affiliations, class_name: 'StashDatacite::Affiliation'
    include StashEngine::Concerns::ResourceUpdated

    scope :completed, -> { where("TRIM(IFNULL(contributor_name, '')) > ''") } # only non-null & blank
    # scope :completed, ->  { where("TRIM(IFNULL(award_number, '')) > '' AND TRIM(IFNULL(contributor_name, '')) > ''") } # only non-null & blank

    ContributorTypes = Datacite::Mapping::ContributorType.map(&:value)

    ContributorTypesEnum = ContributorTypes.map { |i| [i.downcase.to_sym, i.downcase] }.to_h
    ContributorTypesStrToFull = ContributorTypes.map { |i| [i.downcase, i] }.to_h

    enum contributor_type: ContributorTypesEnum

    before_save :strip_whitespace

    amoeba do
      enable
    end

    # scopes for contributor
    scope :with_award_numbers, -> { where("award_number <> ''") }

    def contributor_type_friendly=(type)
      self.contributor_type = type.to_s.downcase unless type.blank?
    end

    def contributor_type_friendly
      return nil if contributor_type.blank?

      ContributorTypesStrToFull[contributor_type]
    end

    def self.contributor_type_mapping_obj(str)
      return nil if str.nil?

      Datacite::Mapping::ContributorType.find_by_value(str)
    end

    def contributor_type_mapping_obj
      return nil if contributor_type_friendly.nil?

      Contributor.contributor_type_mapping_obj(contributor_type_friendly)
    end

    # this is to simulate the bad old structure where a user can only have one affiliation
    def affiliation_id=(affil_id)
      self.affiliation_ids = affil_id
    end

    # this is to simulate the bad old structure where a user can only have one affiliation
    def affiliation_id
      affiliation_ids.try(:first)
    end

    # this is to simulate the bad old structure where a user can only have one affiliation
    def affiliation=(affil)
      affiliations.clear
      affiliations << affil
    end

    # this is to simulate the bad old structure where a user can only have one affiliation
    def affiliation
      affiliations.try(:first)
    end

    private

    def strip_whitespace
      self.contributor_name = contributor_name.strip unless contributor_name.nil?
      self.award_number = award_number.strip unless award_number.nil?
    end
  end
end
