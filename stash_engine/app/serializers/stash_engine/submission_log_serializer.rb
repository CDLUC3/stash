module StashEngine
  class SubmissionLogSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::SubmissionLog.column_names - REJECT_COLUMNS).freeze

  end
end