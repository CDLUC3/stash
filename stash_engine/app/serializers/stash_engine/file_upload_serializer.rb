module StashEngine
  class FileUploadSerializer
    include SerializerMixin

    REJECT_COLUMNS = %w[id resource_id].freeze
    COLUMNS = (StashEngine::FileUpload.column_names - REJECT_COLUMNS).freeze

  end
end