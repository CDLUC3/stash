module StashEngine
  class DescriptionSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::Description.column_names - REJECT_COLUMNS).freeze

  end
end
