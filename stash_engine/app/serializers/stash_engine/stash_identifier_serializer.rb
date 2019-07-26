module StashEngine
  class StashIdentifierSerializer
    include SerializerMixin

    COLUMNS = StashEngine::Identifier.column_names.freeze

    def hash
      generic_hash.merge(
        resources: @my_model.resources.order(:id).map{|res| StashEngine::ResourceSerializer.new(res).hash})
    end

  end
end