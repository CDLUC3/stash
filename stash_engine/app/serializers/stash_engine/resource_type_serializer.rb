module StashEngine
  class ResourceTypeSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashDatacite::ResourceType.column_names - REJECT_COLUMNS).freeze

  end
end
