module StashEngine
  class PublisherSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Publisher.column_names - REJECT_COLUMNS).freeze

  end
end
