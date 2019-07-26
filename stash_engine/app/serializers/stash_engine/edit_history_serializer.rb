module StashEngine
  class EditHistorySerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::EditHistory.column_names - REJECT_COLUMNS).freeze

  end
end