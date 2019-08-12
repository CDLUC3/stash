module StashEngine
  class PublicationYearSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::PublicationYear.column_names - REJECT_COLUMNS).freeze

  end
end
