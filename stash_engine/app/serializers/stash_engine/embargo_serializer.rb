module StashEngine
  class EmbargoSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::Embargo.column_names - REJECT_COLUMNS).freeze

  end
end
