module StashEngine
  class AffiliationSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id].freeze
    COLUMNS = (StashDatacite::Affiliation.column_names - REJECT_COLUMNS).freeze

  end
end
