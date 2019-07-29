module StashEngine
  class ShareSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::Share.column_names - REJECT_COLUMNS).freeze

  end
end
