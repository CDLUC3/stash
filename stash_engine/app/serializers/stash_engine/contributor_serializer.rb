module StashEngine
  class ContributorSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id name_identifier_id].freeze # name_identifier_id is never used in our data
    COLUMNS = (StashDatacite::Contributor.column_names - REJECT_COLUMNS).freeze

    def hash
      super.merge(affiliations: @my_model.affiliations.map { |i| AffiliationSerializer.new(i).hash })
    end

  end
end
